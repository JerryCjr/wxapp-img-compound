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
      quality: 90,
      drawSuccessCallback: () => {
        console.log('canvas draw success');
      }
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
