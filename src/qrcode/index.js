import QRCODE from './qrcode.js';

// support Chinese
function utf16to8(str) {
  var out, i, len, c;
  out = '';
  len = str.length;
  for (i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if ((c >= 0x0001) && (c <= 0x007F)) {
      out += str.charAt(i);
    } else if (c > 0x07FF) {
      out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
    } else {
      out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
    }
  }
  return out;
}

/**
 * @function 绘制二维码
 * @param {string} argv.text 需要转换成二维码的文本
 * @param {string} argv.width 宽
 * @param {string} argv.height 高
 * @param {string} argv.x 坐标x
 * @param {string} argv.y 坐标y
 * @param {string} argv._this 在自定义组件下，当前组件实例的this，表示在这个自定义组件下查找拥有 canvas-id 的 <canvas> ，如果省略则不在任何自定义组件内查找 可选
 * @param {number} argv.ctx 直接传入canvas上下文 可选
 * @param {number} argv.canvasId 要获取上下文的 <canvas> 组件 canvas-id 属性 可选
 * @param {number} argv.typeNumber 二维码的计算模式，默认值-1 可选
 * @param {string} argv.correctLevel 二维码纠错级别 默认值为高级 取值：{ L: 1, M: 0, Q: 3, H: 2 } 可选
 * @param {string} argv.background 二维码背景色 默认为'#ffffff' 可选
 * @param {string} argv.foreground 二维码前景色 默认为'#000000' 可选
 */
function drawQrcode({
  text, // 需要转换成二维码的文本
  width = 256, // 宽
  height = 256, // 高
  x = 0,
  y = 0,
  _this = null,
  ctx = null,
  canvasId = '',
  typeNumber = -1,
  errorCorrectionLevel = 'H',
  background = '#ffffff',
  foreground = '#000000'
} = {}) {
  if (!canvasId && !ctx) {
    throw new Error('please set canvasId or ctx!');
  }

  _draw();

  // this draw is not canvas's draw()
  function _draw() {
    // create the qrcode itself
    let qrcode = new QRCODE(typeNumber, errorCorrectionLevel);
    qrcode.addData(utf16to8(text));
    qrcode.make();

    // get canvas context
    if (!ctx) {
      ctx = _this ? wx.createCanvasContext && wx.createCanvasContext(canvasId, _this) : wx.createCanvasContext && wx.createCanvasContext(canvasId);
    }

    // compute tileW/tileH based on options.width/options.height
    let tileW = width / qrcode.getModuleCount();
    let tileH = height / qrcode.getModuleCount();

    // draw in the canvas
    for (let row = 0; row < qrcode.getModuleCount(); row++) {
      for (let col = 0; col < qrcode.getModuleCount(); col++) {
        let style = qrcode.isDark(row, col) ? foreground : background;
        ctx.setFillStyle(style);
        let w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
        let h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
        ctx.fillRect(Math.round(col * tileW) + x, Math.round(row * tileH) + y, w, h);
      }
    }
  }
}

export default drawQrcode;
