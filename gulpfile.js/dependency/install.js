const path = require('path');
const {
  src,
  series
} = require('gulp');
const gulpInstall = require('gulp-install');
const directoryHelper = require('../../tools/directoryHelper.js');
const fileHelper = require('../../tools/fileHelper.js');
const assert = require('../../tools/assert.js');
const _ = require('../../tools/utils.js');
const resolveDependencies = require('./index.js').resolveDependencies;

const distPackageJsonPath = path.resolve('dist', 'package.json');
const miniprogramNpmPath = path.resolve('dist', 'miniprogram_npm');
const nodeModulesPath = path.resolve('dist', 'node_modules');

/**
 * @description copy package / find package's entry
 * @author Jerry Cheng
 * @date 2019-03-15
 * @param {*} sourceFileName
 */
async function packageHander(sourceFileName) {
  const jsonSourcePath = path.resolve(nodeModulesPath, sourceFileName); // PackageJson Source
  const hackFilePath = sourceFileName.replace(/\/node_modules/, '');
  const jsonDestPath = path.resolve(miniprogramNpmPath, hackFilePath); // PackageJson Copy
  await fileHelper.copy(jsonSourcePath, jsonDestPath);

  // Dependency Copy
  const packageJson = require(jsonSourcePath);
  const dependencyDir = path.dirname(sourceFileName);
  const main = _.fixPathToJs(packageJson.main);
  const dependencySourcePath = path.resolve(nodeModulesPath, dependencyDir, main); // 依赖源
  const hackDirPath = path.dirname(hackFilePath);
  const dependencyDestPath = path.resolve(miniprogramNpmPath, hackDirPath, main);

  const customComponentFlag = packageJson['miniprogram'] && packageJson['miniprogram'] === 'miniprogram_dist'; // 宝玩微信小程序自定义组件 微信小程序自定义组件
  const purejsFlag = packageJson['main'] && packageJson['main'] === 'miniprogram_dist/index.js'; // 宝玩微信小程序纯js模块

  if (customComponentFlag || purejsFlag) {
    const miniprogramDistPath = path.resolve(nodeModulesPath, dependencyDir, 'miniprogram_dist');
    const relative = dependencyDir + '/miniprogram_dist';
    const priority = 2;
    try {
      await recursiveReadDir(priority, relative, miniprogramDistPath, copyFile);
    } catch (error) {
      assert.error(error);
    }
  } else {
    // 入口依赖解析
    assert.warn('dependencySourcePath', dependencySourcePath);
    const dependencyContent = await fileHelper.read(dependencySourcePath);
    const file = {
      path: dependencySourcePath,
      contents: dependencyContent,
      extname: path.extname(dependencySourcePath)
    };
    const dependencyDestContent = resolveDependencies(file, 'miniprogram_npm');
    try {
      await directoryHelper.create(path.dirname(dependencyDestPath));
      await fileHelper.write(dependencyDestPath, dependencyDestContent);
    } catch (error) {
      assert.error(error);
    }
  }
}

/**
 * @description copyFile 拷贝文件
 * @author Jerry Cheng
 * @date 2019-03-15
 * @param {Sting} sourceFileName 源文件路径
 */
async function copyFile(sourceFileName) {
  const sourcePath = path.resolve(nodeModulesPath, sourceFileName); // packageJson源地址
  const destPath = path.resolve(miniprogramNpmPath, sourceFileName);
  const extname = path.extname(sourcePath);
  // js/json need to be resolved
  // other file only need to be copied
  if (/(js|json)/.test(extname)) {
    const dependencyContent = await fileHelper.read(sourcePath);
    const file = {
      path: sourcePath,
      contents: dependencyContent,
      extname: path.extname(sourcePath)
    };
    const dependencyDestContent = resolveDependencies(file, 'miniprogram_npm');
    try {
      await directoryHelper.create(path.dirname(destPath));
      await fileHelper.write(destPath, dependencyDestContent);
    } catch (error) {
      assert.error(error);
    }
  } else {
    await fileHelper.copy(sourcePath, destPath);
  }
}

// 只解析package.json
const recursiveReadDir = async (priority, relative, dir, handler) => {
  const dirents = await directoryHelper.read(dir, {
    withFileTypes: true
  });
  const promises = dirents.map(async dirent => {
    const direntName = dirent.name;
    if (dirent.isDirectory()) {
      await recursiveReadDir(priority, path.join(relative, direntName), path.resolve(dir, direntName), handler);
    } else if (dirent.isFile()) {
      if (priority === 1) {
        if (direntName === 'package.json') {
          await handler(path.join(relative, direntName));
        }
      } else {
        await handler(path.join(relative, direntName));
      }
    }
  });
  await promises;
};

const createPackageJson = async () => {
  const packageJson = _.readJson(path.resolve('package.json'));
  const dependencies = packageJson.dependencies || {};
  await _.writeFile(distPackageJsonPath, JSON.stringify({
    dependencies
  }, null, '\t'));
};

const npmInstall = () => {
  return src(distPackageJsonPath)
    .pipe(gulpInstall({
      production: true
    }));
};

// 重组node_modules
const recombine = async () => {
  const relative = '';
  const priority = 1;
  await recursiveReadDir(priority, relative, nodeModulesPath, packageHander);
};

const install = series(createPackageJson, npmInstall, recombine);
// const install = series(recombine);

module.exports = install;
