const path = require('path');
const get = require('lodash.get');
const send = require('koa-send');
const axios = require('axios');
const PWD = process.env.PWD;
const clientPort = process.env.CLIENT_PORT || 9888;
const devHost = `http://localhost:${clientPort}`;
const resolve = file => path.resolve(__dirname, file);

const staticSuffixList = ['js', 'css', 'jpg', 'jpeg', 'png', 'gif', 'map', 'json'];

const devStatic = async (ctx, next) => {

  const url = ctx.path;

  if (url.includes('favicon.ico')) {
    return send(ctx, url, { root: resolve(PWD + '/public') })
  }

  // In the development environment, you need to support every static file without CDN
  if (staticSuffixList.includes(url.split('.').pop())) {
    return ctx.redirect(devHost + url)
  }

  const clientEntryFile = await axios.get(devHost + '/index.html');

  ctx.set('content-type', 'text/html');
  ctx.set('x-powered-by', 'koa/development');
  ctx.body = clientEntryFile.data;
};

module.exports = devStatic;
