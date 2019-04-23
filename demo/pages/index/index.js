import {
  UTYPE,
  compound
} from '../../miniprogram_dist/index.js';
Page({
  onReady() {
    const options = [{
      type: UTYPE['IMG'],
      // type: UTYPE['TEXT'],
      x: 0,
      y: 0,
      width: 375,
      height: 667,
      content: 'http://ppbd7ianm.bkt.clouddn.com/post_02.jpg'
    },
    {
      // type: UTYPE['IMG'],
      type: UTYPE['IMG'],
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      content: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg'
    },
    {
      type: UTYPE['TEXT'],
      x: 0,
      y: 100,
      content: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg',
      color: 'red',
      textAlign: 'left',
      maxLength: 16
    },
    {
      type: UTYPE['TEXT'],
      x: 0,
      y: 150,
      content: 'hello world',
      color: 'red',
      textAlign: 'left',
      maxLength: 16
    },
    {
      type: UTYPE['QRCODE'],
      x: 20,
      y: 300,
      width: 200,
      height: 200,
      text: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg'
    },
    {
      type: UTYPE['TEXT'],
      x: 0,
      y: 200,
      content: '你好宝宝',
      color: 'red',
      textAlign: 'left',
      maxLength: 16
    }];
    compound('ocanvas', options);
  }
});
