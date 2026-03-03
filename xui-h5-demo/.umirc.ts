import { defineConfig } from 'umi';
import pxToViewPort from 'postcss-px-to-viewport';

export default defineConfig({
  title: '', //getMultilingualText('umirc.1',''),
  routes: [
    { path: '/', component: 'home' },
  ],
  npmClient: 'yarn',
  // publicPath: '/poc/',
  publicPath: '/proxy/assets/massistant/xuiweb/',
  history: {
    type: 'hash',
  },
  // https:{},

  jsMinifier: 'terser',
  extraPostCSSPlugins: [
    pxToViewPort({
      unitToConvert: 'rpx',
      viewportWidth: 750,
      unitPrecision: 3,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      // selectorBlackList: [], //指定不转换为视窗单位的类名
      minPixelValue: 1,
      mediaQuery: false,
      replace: true,
      exclude: [/node_modules/],
      landscape: false,
      // landscapeUnit: 'vw',
      // landscapeWidth: 568,
    }),
  ],
  // headScripts: ['/proxy/assets/massistant/xuiweb/mpaas-xui-h5-sdk.js'],
  // headScripts: ['http://192.168.43.8:8088/mpaas-xui-h5-sdk.js'],
  proxy: {
    '/stream_chat': {
      'target': 'http://100.83.100.64:80',
      'changeOrigin': true,
      'pathRewrite': { '^/stream_chat': '/stream_chat' },
      'headers': {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      }
    },
    '/resource': {
      'target': 'http://11.166.226.182:7001',
      'changeOrigin': true,
      'pathRewrite': { '^/resource': '/resource' },
      'headers': {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      }
    },
    '/history': {
      'target': 'http://100.83.100.64:80',
      'changeOrigin': true,
      'pathRewrite': { '^/history': '/history' },
      'headers': {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      }
    }
  }
});
