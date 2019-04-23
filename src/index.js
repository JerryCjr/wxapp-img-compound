import wapi from './wapi.js';
import qrcodeCreate from './qrcode/index.js';

const IMG = Symbol('IMG');
const TEXT = Symbol('TEXT');
const QRCODE = Symbol('QRCODE');

// 支持合成图片 文本 二维码
const UTYPE = {
  IMG,
  TEXT,
  QRCODE
};

// 合成图片
const _drawImg = async function ({ content, x, y, width, height, drawSuccessCallback = null }) {
  if (!content) return;
  let r;
  try {
    r = await wapi.getImageInfoAsync({ src: content });
  } catch (error) {
    throw new Error(error);
  }
  if (r) {
    this.drawImage(r.path, x, y, width, height);
  }
};

/**
 * @function 生成文字
 * @param {string} argv.content 在画布上输出的文本
 * @param {number} argv.x 绘制文本的左上角 x 坐标位置
 * @param {number} argv.y 绘制文本的左上角 y 坐标位置
 * @param {string} argv.color 绘制的颜色 默认黑色, 可选
 * @param {number} argv.fontSize 绘制的字体大小 默认14 可选
 * @param {string} argv.textAlign 绘制的文字的对齐方式 默认left 合法值为: left center right 可选
 * @param {string} argv.textBaseline 绘制的文字的竖直对齐方式 normal 合法值为: top bottom middle normal
 * @param {string} argv.maxWidth 需要绘制的最大宽度，默认0及不做限制 可选
 * @param {string} argv.maxLength 需要绘制的最大长度，默认0 及不做限制 可选
 */
const _drawText = async function ({
  content,
  x,
  y,
  color = 'black',
  fontSize = 24,
  textAlign = 'left',
  textBaseline = 'normal',
  maxWidth = 0,
  maxLength = 0 }) {
  if (!content) return;

  if (maxLength && String(content).length > maxLength) {
    console.log('最大长度限制溢出截断');
    content = content.slice(0, maxLength);
  }

  this.setFontSize(Number(fontSize));
  this.setFillStyle(String(color));
  this.setTextAlign(textAlign);
  this.setTextAlign(textBaseline);

  if (maxWidth) {
    this.fillText(String(content), x, y, maxWidth);
  } else {
    this.fillText(String(content), x, y, null);
  }
};

// 合成二维码
const _drawQrcode = async function ({
  text,
  x,
  y,
  width,
  height,
  image
}) {
  const callback = null;
  qrcodeCreate({
    text, x, y, width, height, ctx: this, image, callback
  });
};

// canvas draw
const _draw = async function () {
  return new Promise((resolve, reject) => {
    this.draw(true, async () => {
      let r;
      try {
        r = await wapi.canvasToTempFilePathAsync({
          // x: 0,
          // y: 0,
          // width: 300,
          // height: 400,
          destWidth: 375,
          destHeight: 400,
          canvasId: 'ocanvas'
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
      if (r) {
        resolve(r);
      }
    });
  });
};

/**
 * @function 自定义合成
 * @param {string} canvasId canvasId
 * @param {array} options 合成选项配置 元素的先后顺序决定了层级顺序
 */
const compound = async function (canvasId, options) {
  if (!canvasId) return;
  const ctx = wapi.createCanvasContext(canvasId);
  for (let index = 0; index < options.length; index++) {
    console.log(['index', index]);
    const element = options[index];
    switch (element.type) {
      case UTYPE['TEXT']:
        console.log('文字合成');
        await _drawText.call(ctx, element);
        break;
      case UTYPE['QRCODE']:
        console.log('二维码合成');
        await _drawQrcode.call(ctx, element);
        break;
      default:
        console.log('图片合成');
        await _drawImg.call(ctx, element);
        break;
    }
  }
  let r = await _draw.call(ctx, canvasId);
  console.log(r);
};

export {
  compound,
  UTYPE
};
