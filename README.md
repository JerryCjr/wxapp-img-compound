# babyfs-wxapp-img-compound

微信小程序下自定义合成图片插件,支持类型:

* 自定义图片
* 自定义文本
* 自定义url转二维码

## Build Setup

``` bash
# install dependencies
npm install

# serve development program
npm run dev

# build for production
npm run prod
```

## How to use

> bash

``` bash
  npm install --save babyfs-wxapp-img-compound
```
> wxml

```html
<view class="container">
  <canvas
    class="o-canvas"
    canvas-id="ocanvas"
    style="width: 100vw; height: 90vh;"
  >
  </canvas>
  <view>
    <button size="mini" bindtap="store">保存都本地相册</button>
  </view>
</view>

```
>js

``` javascript

import wapi from 'babyfs-wxapp-api';
import {
  UTYPE,
  compound
} from '../../miniprogram_dist/index.js';

Page({
  data: {
    path: ''
  },
  async onReady() {
    const options = [{
      type: UTYPE['IMG'],
      // type: UTYPE['TEXT'],
      x: 0,
      y: 0,
      width: 375,
      height: 667,
      path: 'http://ppbd7ianm.bkt.clouddn.com/post_02.jpg'
    },
    {
      // type: UTYPE['IMG'],
      type: UTYPE['IMG'],
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      path: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg'
    },
    {
      type: UTYPE['TEXT'],
      x: 0,
      y: 100,
      text: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg',
      color: 'red',
      textAlign: 'left',
      maxLength: 16
    },
    {
      type: UTYPE['TEXT'],
      x: 0,
      y: 150,
      text: 'hello world',
      color: 'red',
      textAlign: 'left',
      maxLength: 16
    },
    // {
    //   type: UTYPE['QRCODE'],
    //   x: 20,
    //   y: 300,
    //   width: 200,
    //   height: 200,
    //   text: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg'
    // },
    // {
    //   type: UTYPE['QRCODE'],
    //   x: 20,
    //   y: 300,
    //   width: 200,
    //   height: 200,
    //   text: 'hello world'
    // },
    {
      type: UTYPE['QRCODE'],
      x: 20,
      y: 300,
      width: 200,
      height: 200,
      text: '宝宝玩英语'
      // background: '#098fe1'
    },
    {
      type: UTYPE['TEXT'],
      x: 0,
      y: 200,
      text: '你好宝宝',
      color: 'red',
      textAlign: 'left',
      maxLength: 16
    }];
    const config = {
      // x: 0,
      // y: 0,
      destWidth: 375,
      destHeight: 667,
      fileType: 'jpg',
      quality: 0.9
    };
    let r;
    try {
      r = await compound('ocanvas', options, config);
    } catch (error) {
      console.log(error);
    }
    if (r.errMsg === 'canvasToTempFilePath:ok') {
      this.setData({
        path: r.tempFilePath
      });
    }
  },

  async store() {
    const path = this.data.path;
    let r;
    if (path) {
      console.log('store');
      try {
        r = await wapi.saveImageToPhotosAlbumAsync({ filePath: path });
      } catch (error) {
        console.log(error);
      }
    }
    if (r) {
      console.log(r);
    }
  }
});

```

## API

### export.UTYPE [Object]

| name   | type   | description    |
| ------ | ------ | -------------- |
| IMG    | symbol | 支持图片类型   |
| TEXT   | symbol | 支持文本类型   |
| QRCODE | symbol | 支持二维码类型 |

### export.compound(canvasid, options, config) [Function]

#### compound params

| name     | type   | required | default    | description        |
| -------- | ------ | -------- | ---------- | ------------------ |
| canvasid | string | yes      | no default | canvas id          |
| options  | array  | yes      | no default | 要合成的选项数组   |
| config   | object | yes      | no default | 绘制成功的配置信息 |

##### element of options [Object]

| name   | type       | required | default      | description                                         |
| ------ | ---------- | -------- | ------------ | --------------------------------------------------- |
| type   | UTYPE[key] | yes      | UTYPE['IMG'] | 图片合成                                            |
| path   | string     | yes      | no default   | 所要绘制的图片资源                                  |
| x      | number     | yes      | 0            | 图像的左上角在目标canvas上x轴的位置                 |
| y      | number     | yes      | 0            | 图像的左上角在目标canvas上y轴的位置                 |
| width  | number     | yes      | 256          | 在目标画布上绘制图像的宽度 允许对绘制的图像进行缩放 |
| height | number     | yes      | 256          | 在目标画布上绘制图像的高度 允许对绘制的图像进行缩放 |

##### element of options [Object]

| name         | type       | required | default       | description                         |
| ------------ | ---------- | -------- | ------------- | ----------------------------------- |
| type         | UTYPE[key] | yes      | UTYPE['TEXT'] | 文字合成                            |
| text         | string     | yes      | ''            | 索要绘制的文本内容                  |
| x            | number     | yes      | 0             | 文字的左上角在目标canvas上x轴的位置 |
| y            | number     | yes      | 0             | 文字的左上角在目标canvas上y轴的位置 |
| color        | string     | no       | 'black'       | 绘制的颜色                          |
| fontSize     | number     | no       | 0             | 图像的左上角在目标canvas上y轴的位置 |
| textAlign    | string     | no       | 'left'        | 绘制的文字的对齐方式                |
| textBaseline | string     | no       | 'normal'      | 绘制的文字的竖直对齐方式            |
| maxWidth     | number     | no       | no default    | 绘制的最大宽度                      |
| maxLength    | number     | no       | no default    | 绘制的最大长度                      |

##### element of options [Object]

| name                 | type       | required | default         | description                           |
| -------------------- | ---------- | -------- | --------------- | ------------------------------------- |
| type                 | UTYPE[key] | yes      | UTYPE['QRCODE'] | 二维码合成                            |
| text                 | string     | yes      | ''              | 需要转化二维码的文本                  |
| x                    | number     | yes      | 0               | 二维码的左上角在目标canvas上x轴的位置 |
| y                    | number     | yes      | 0               | 二维码左上角在目标canvas上x轴的位置   |
| width                | number     | yes      | 256             | 生成二维码的宽                        |
| height               | number     | yes      | 256             | 生成二维码的高                        |
| _this                | object     | no       | null            | 组件实例                              |
| ctx                  | object     | no       | null            | canvas上下文                          |
| canvasId             | string     | no       | null            | canvas-id                             |
| typeNumber           | number     | no       | -1              | 二维码的计算模式                      |
| errorCorrectionLevel | number     | no       | 'H' (高级)      | 二维码纠错级别('L','M','Q','H')       |
| background           | number     | no       | '#ffffff'       | 二维码背景色                          |
| foreground           | number     | no       | '#000000'       | 二维码前景色                          |

#### config [Object]

与[wx.canvasToTempFilePath参数](https://developers.weixin.qq.com/miniprogram/dev/api/wx.canvasToTempFilePath.html)保持一致

#### return [Object]

其实是canvasToTempFilePath成功回调返回的值
