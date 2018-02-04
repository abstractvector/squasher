import Koa from 'koa';
import KoaRouter from 'koa-router';
import raw from 'raw-body';

import Image from './image';

const app = new Koa();

const router = new KoaRouter();

// entry point to the image optimizer
router.post('*', async (ctx, next) => {
  const image = new Image(await raw(ctx.req));

  // parse out which processes we want to apply to the image
  const processes = ctx.request.url.split('/').filter(v => !!v).map(v => {
    const p = v.match(/([a-z]+)=(.+)/);
    const process = p[1];

    let o, options = {};
    switch (process) {
      case 'size':
        o = p[2].split('x');
        options = { width: parseInt(o[0]) || null, height: parseInt(o[1]) || null };
        break;

      case 'crop':
        options = { gravity: p[2] || null };
        break;

      default:
        return null;
    }

    return { process, options }
  }).filter(v => !!v);

  // process the image
  const processedImage = await image.process(processes, {
    supportedTypes: [
      ctx.accepts('image/jpeg') ? 'jpeg' : null,
      ctx.accepts('image/png') ? 'png' : null,
      ctx.request.header.accept.indexOf('image/webp') > -1 ? 'webp' : null
    ].filter(v => null !== v)
  });


  ctx.status = 200;
  ctx.type = `image/${processedImage.format}`;
  ctx.body = processedImage.buffer;
});

app.use(router.routes());
app.use(router.allowedMethods());

// listen on the specified port
app.listen(3000);