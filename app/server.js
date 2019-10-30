const koa = require("koa");
const koaStatic = require("koa-static");
const path = require("path");

const app = new koa();

const devSsrMiddleWare = require("./middlewares/dev.ssr");
const devStaticMiddleWare = require("./middlewares/dev.static");

console.log(process.env.NODE_ENV);



app.use(koaStatic(
  path.join(__dirname, "./public")
));

if (process.env.NODE_ENV === "dev") {

  app.use(devStaticMiddleWare);

  app.use(devSsrMiddleWare);
}

app.use(async ctx => {
  ctx.body = "Hello World";
});

app.listen(3000);
