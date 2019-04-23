const path = require('path');
const through = require('through2');
const j = require('jscodeshift');

const fileHelper = require('../../tools/fileHelper.js');
const directoryHelper = require('../../tools/directoryHelper.js');
const assert = require('../../tools/assert.js');
const _ = require('../../tools/utils.js');

/**
 * @description 查找external模块
 * @author Jerry Cheng
 * @date 2019-03-20
 * @param {*} baseDirectory 查找的起始路径
 * @param {*} moduleName 模块名称
 * @returns external路径
 */
function findInNodeModules(baseDirectory, moduleName) {
  const tryFindPath = path.resolve(baseDirectory, 'node_modules', moduleName);
  if (directoryHelper.existSync(tryFindPath)) {
    return tryFindPath;
  } else {
    if (baseDirectory === '/') {
      throw new Error(`can not find module ${moduleName}`);
    } else {
      return findInNodeModules(path.resolve(baseDirectory, '..'), moduleName);
    }
  }
}

/**
 * @description 比较相对路径的hack方法
 * @author Jerry Cheng
 * @date 2019-03-14
 * @param {String} path
 * @returns hack路径
 */
function assumedPathDev(filePath, importPath) {
  const dReg = new RegExp(/\/dist\//);
  const sReg = new RegExp(/(src|demo)/);
  if (dReg.test(importPath) && sReg.test(filePath)) {
    let replaceStr = filePath.match(sReg)[0];
    let r = importPath.replace(dReg, `/${replaceStr}/`);
    return r;
  }
}

/**
 * @description 判断依赖类型 本地依赖/三方库依赖
 * @author Jerry Cheng
 * @date 2019-03-20
 * @param {String} filePath 文件原始路径
 * @param {String} pathBeforeResolved 处理依赖前的路径
 * @returns 包含type类型和path信息的对象
 */

function judgeModuleType(filePath, pathBeforeResolved) {
  // assert.log(pathBeforeResolved);
  let flag;
  let localPath;
  let externalPath;
  localPath = path.resolve(path.dirname(filePath), pathBeforeResolved);
  flag = fileHelper.existSync(localPath);
  if (flag) {
    assert.info('依赖类型属于本地依赖');
    assert.warn('localPath', localPath);
  } else {
    assert.info('依赖类型属于三方库依赖');
    try {
      externalPath = findInNodeModules(path.dirname(filePath), pathBeforeResolved);
    } catch (error) {
      assert.error(error);
    }
    assert.warn('externalPath', externalPath);
  }

  return {
    type: flag ? 'local' : 'external',
    path: flag ? localPath : externalPath
  };
}

/**
 * @description 处理路径
 * @author Jerry Cheng
 * @date 2019-03-20
 * @param {String} filePath 文件原始路径
 * @param {String} externalPath 文件依赖路径
 * @param {String} type 处理依赖类型 wxapp/miniprogram_npm
 * @returns
 */
function resolving(filePath, externalPath, type) {
  assert.warn('filePath', filePath);
  let targetDirectory;
  let installedDirectory;
  let copyDestImportFile;
  let externalRelativePath;
  // eg: externalPath: @chengjinrui/module_c/index.js
  if (path.extname(externalPath) === '.js') {
    externalPath = path.dirname(externalPath);
  }
  const copySourcePackFile = path.resolve(externalPath, 'package.json');
  const packageJson = require(copySourcePackFile);
  switch (type) {
    case 'miniprogram_npm':
      copyDestImportFile = path.resolve(externalPath, `${packageJson.main}`);
      externalRelativePath = path.relative(path.dirname(filePath), copyDestImportFile).replace(/node_modules\//, '');
      break;
    default:
      targetDirectory = 'dist/miniprogram_npm';
      installedDirectory = path.resolve(targetDirectory, packageJson.name);
      copyDestImportFile = path.resolve(installedDirectory, `${packageJson.main}`);
      if (/src\/.*/.test(filePath)) {
        externalRelativePath = path.relative(filePath, assumedPathDev(filePath, copyDestImportFile));
      } else {
        externalRelativePath = path.relative(path.dirname(filePath), assumedPathDev(filePath, copyDestImportFile));
      }
      break;
  }
  const r = _.fixPathToJs(externalRelativePath);
  assert.warn('源文件对于解析后的依赖文件的相对路径', r);
  return r;
}

/**
 * @description json依赖解析
 * @author Jerry Cheng
 * @date 2019-03-15
 * @param {*} file
 * @returns
 */
function parseJsonFile(file) {
  const filePath = file.path;
  const source = require(filePath);

  if (source.usingComponents) {
    const handleComponentReference = () => {
      let keys = Object.keys(source.usingComponents);
      keys.map(key => {
        let componentPathBeforeResolved;
        let componentPathAfterResolved;
        componentPathBeforeResolved = source.usingComponents[key];
        const judgement = judgeModuleType(filePath, componentPathBeforeResolved);
        if (judgement.type === 'external' && judgement.path) {
          componentPathAfterResolved = resolving(filePath, judgement.path).replace('.js', ''); // component特殊一点 去掉结尾的index.js
          source.usingComponents[key] = componentPathAfterResolved;
          assert.warn('componentPathBeforeResolved', componentPathBeforeResolved);
          assert.warn('componentPathAfterResolved', componentPathAfterResolved);
        }
      });
    };
    handleComponentReference();
  }
  return JSON.stringify(source, null, 2);
}

/**
 * @description js依赖解析
 * @author Jerry Cheng
 * @date 2019-03-15
 * @param {*} file
 * @returns
 */
function parseJsFile(file, type) {
  const filePath = file.path;
  const fileContent = file.contents.toString('utf8');
  const source = j(fileContent);
  // assert.log(filePath);

  // 处理import依赖
  const importHandler = () => {
    const imports = source.find(j.ImportDeclaration);
    let importPathBeforeResolved;
    let importPathAfterResolved;
    imports.map(paths => {
      importPathBeforeResolved = paths.value.source.value;
      const judgement = judgeModuleType(filePath, importPathBeforeResolved);
      // assert.info(judgement);
      if (judgement.type === 'external' && judgement.path) {
        importPathAfterResolved = resolving(filePath, judgement.path, type);
        assert.warn('importPathBeforeResolved', importPathBeforeResolved);
        assert.warn('importPathAfterResolved', importPathAfterResolved);
        paths.value.source = j.literal(importPathAfterResolved);
      }
    });
  };

  // 处理require依赖
  const requireHandler = function () {
    const requires = source
      .find(j.CallExpression, {
        callee: {
          name: 'require'
        }
      })
      .filter(requireStatement => requireStatement.value.arguments.length === 1 && requireStatement.value.arguments[0].type === 'Literal');
    let requirePathBeforeResolved;
    let requirePathAfterResolved;
    requires.map((paths) => {
      requirePathBeforeResolved = paths.value.arguments[0].value;
      const judgement = judgeModuleType(filePath, requirePathBeforeResolved);
      // assert.info(judgement);
      if (judgement.type === 'external' && judgement.path) {
        requirePathAfterResolved = resolving(filePath, judgement.path, type);
        assert.warn('requirePathBeforeResolved', requirePathBeforeResolved);
        assert.warn('requirePathAfterResolved', requirePathAfterResolved);
        paths.value.arguments = [j.literal(requirePathAfterResolved)];
      }
    });
  };

  importHandler();
  requireHandler();

  return source.toSource({
    quote: 'single'
  });
}

/**
 * @description 解析依赖
 * @author Jerry Cheng
 * @date 2019-03-20
 * @param {*} file
 * @param {string} [type='wxapp'] 默认解析微信小程序文件依赖
 * @param {string} [type='miniprogram_npm'] 解析dist/miniprogram_npm每个module的文件依赖
 * @returns 文本内容
 */
function resolveDependencies(file, type = 'wxapp') {
  switch (file.extname) {
    case '.json':
      return parseJsonFile(file);
    case '.js':
      return parseJsFile(file, type);
  }
}

module.exports.resolveDependencies = resolveDependencies;

module.exports.dependency = function dependency() {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }
    if (file.isStream()) {
      assert.error('ERROR: Streaming not supported');
      return cb();
    }
    file.extname = path.extname(file.path);
    const content = resolveDependencies(file);
    file.contents = Buffer.from(content);
    this.push(file);
    cb();
  });
};
