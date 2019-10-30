const koa = require("koa");
const koaStatic = require("koa-static");
const path = require("path");

const app = new koa();

const devSsrMiddleWare = require("./middlewares/dev.ssr");
const devStaticMiddleWare = require("./middlewares/dev.static");

const prodSsrMiddleWare = require("./middlewares/prod.ssr");

console.log(process.env.NODE_ENV);
console.log(process.env.PWD);


app.use(koaStatic(
  path.join(__dirname, "./public")
));

app.use(koaStatic(
  path.join(__dirname, "../dist")
));

if (process.env.NODE_ENV === "dev") {

  app.use(devStaticMiddleWare);

  app.use(devSsrMiddleWare);
} else {
  app.use(prodSsrMiddleWare);
}

app.use(async ctx => {
  ctx.body = "Hello World";
});

app.listen(3000);
