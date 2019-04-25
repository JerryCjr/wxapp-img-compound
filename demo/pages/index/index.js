import wapi from 'babyfs-wxapp-api';
import {
  UTYPE,
  compound
} from '../../miniprogram_dist/index.js';

Page({
  data: {
    path: ''
  },
  customData: {
    options: [],
    config: null
  },
  async onReady() {
    this.customData.options = [{
      type: UTYPE['IMG'],
      x: 0,
      y: 0,
      width: 220,
      height: 389,
      path: 'http://ppbd7ianm.bkt.clouddn.com/post_02.jpg'
    },
    {
      type: UTYPE['IMG'],
      x: 0,
      y: 0,
      width: 220,
      height: 389,
      path: 'http://ppbd7ianm.bkt.clouddn.com/%E9%95%82%E7%A9%BA%E5%A4%A7.png'
    },
    {
      type: UTYPE['QRCODE'],
      x: 40,
      y: 328,
      width: 40,
      height: 40,
      text: '宝宝玩英语'
      // text: 'http://ppbd7ianm.bkt.clouddn.com/tom_01.jpeg'
      // background: '#098fe1'
    },
    {
      type: UTYPE['TEXT'],
      x: 130,
      y: 70,
      text: '你好宝宝',
      color: 'black',
      textAlign: 'left',
      fontSize: 20,
      maxLength: 16
    }];
    this.customData.config = {
      reserve: true,
      // x: 0,
      // y: 0,
      destWidth: 220,
      destHeight: 389,
      fileType: 'jpg',
      quality: 1
    };
  },

  // 绘制
  async draw() {
    let response;
    try {
      response = await compound('ocanvas', this.customData.options, this.customData.config);
    } catch (error) {
      console.log(error);
    }
    if (response.errMsg === 'canvasToTempFilePath:ok') {
      this.setData({
        path: response.tempFilePath
      });
    }
  },

  // 保存到本地
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
  },

  // 从本地相册选择
  async choose() {
    let r;
    try {
      r = await wapi.chooseImageAsync({
        count: 1
      });
    } catch (error) {
      console.log(error);
    }
    if (r && r.tempFilePaths) {
      this.customData.options[0] = {
        type: UTYPE['IMG'],
        x: 0,
        y: 0,
        width: 220,
        height: 389,
        path: r.tempFilePaths[0]
      };
    }
  }
});
