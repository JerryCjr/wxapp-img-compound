import {
  QRCode,
  QRErrorCorrectLevel
} from './qrcode.js';

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

function drawQrcode({
  _this = null,
  canvasId,
  ctx = null,
  text,
  width = 256,
  height = 256,
  x = 0,
  y = 0,
  typeNumber = -1,
  correctLevel = QRErrorCorrectLevel.H,
  background = '#ffffff',
  foreground = '#000000'
} = {}) {
  if (!canvasId && !ctx) {
    console.warn('please set canvasId or ctx!');
    return;
  }

  _draw();

  // this draw is not canvas's draw()
  function _draw() {
    // create the qrcode itself
    let qrcode = new QRCode(typeNumber, correctLevel);
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
