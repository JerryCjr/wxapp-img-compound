/* eslint-disable no-console */
const colors = require('colors');
let __debug = false;

function clog() {
  if (__debug) {
    console.log.apply(console, arguments);
  }
}

function info(msg) {
  if (__debug) {
    console.log(colors.blue(msg));
  }
}

function log(title) {
  if (__debug) {
    console.log(colors.inverse.green(`【${title}】`));
  }
}

function warn(title, msg) {
  if (__debug) {
    console.log(colors.inverse.yellow(`【${title}】`), colors.yellow(`${msg}`));
  }
}

function error(error) {
  if (__debug) {
    console.log(colors.red(`【${error}】`));
  }
}

module.exports = {
  get debug() {
    return __debug;
  },
  set debug(v) {
    __debug = v;
  },
  clog,
  info,
  log,
  warn,
  error
};
