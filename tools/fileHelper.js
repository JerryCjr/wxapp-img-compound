/* eslint-disable no-return-await */
const fs = require('fs');
const path = require('path');
const promiseWrapper = require('./promiseWrapper').convertPromise;
const directoryHelper = require('./directoryHelper');

function existSync(filename) {
  try {
    fs.accessSync(filename, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

async function read(filename) {
  if (!existSync(filename)) {
    throw new Error(`Failed to read ${filename}! Can't find the target file.`);
  }
  let content = await new Promise((resolve, reject) => {
    let rs = fs.createReadStream(filename);
    let result = '';
    rs.on('data', (data) => {
      result += data;
    }).on('end', () => {
      resolve(result);
    }).on('close', () => {
      // console.log('close');
    }).on('error', (error) => {
      reject(error);
    });
  });
  return content;
}

async function write(filename, content, append = false) {
  let flag = (existSync(filename) && append) ? 'a' : 'w';
  let result = await new Promise((resolve, reject) => {
    let ws = fs.createWriteStream(filename, {
      flags: flag
    });
    ws.on('finish', () => {
      resolve('finish');
    }).on('close', () => {
      resolve('close');
    }).on('error', (error) => {
      reject(error);
    });
    let contentBuffer = Buffer.from(content);
    let length = contentBuffer.length;
    let hasWriteLength = 0;
    writeChunk();

    function writeChunk() {
      let writeResult = true;
      while (writeResult && hasWriteLength < length) {
        let restLength = length - hasWriteLength;
        let toWriteLength = restLength < 10240 ? restLength : 10240;
        let toWriteBuffer = contentBuffer.slice(hasWriteLength, hasWriteLength + toWriteLength);
        writeResult = ws.write(toWriteBuffer);
        hasWriteLength += toWriteLength;
      }
      if (!writeResult) {
        ws.once('drain', writeChunk);
        return;
      }
      if (hasWriteLength === length) {
        ws.end();
      }
    }
  });
  return result;
}

/**
 * 复制文件
 * @param {String} sourceFile
 * @param {String} destinationFile
 */
async function copy(sourceFile, destinationFile) {
  let destDir = path.dirname(destinationFile);
  await directoryHelper.create(destDir);
  return await promiseWrapper(fs.copyFile)(sourceFile, destinationFile);
}

module.exports = {
  read,
  write,
  existSync,
  copy
};
