const Server = require("koa");
const app = new Server();

const devMiddleWare = require("./middlewares/dev");
const devSsrMiddleWare = require("./middlewares/dev.ssr");

// app.use(devMiddleWare);
app.use(devSsrMiddleWare);

app.use(async ctx => {
  ctx.body = "Hello World";
});

app.listen(3000);
