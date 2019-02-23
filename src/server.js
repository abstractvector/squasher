import fs from 'fs';
import path from 'path';

import Koa from 'koa';
import KoaRouter from 'koa-router';
import raw from 'raw-body';

import Image from './image';
import imageSize from 'image-size';
import parseContext from './parser';

const app = new Koa();
const router = new KoaRouter();

const basePath = process.env.SQUASHER_BASE_PATH || process.cwd();
const allowedFileExtensions = ['.gif', '.jpg', '.jpeg', '.png'];

// entry point to the image optimizer
router.post('*', async (ctx, next) => {
  const image = new Image(await raw(ctx.req));

  let { processes, options } = parseContext(ctx);

  let processedImage = await image.process(processes, options);

  ctx.status = 200;
  ctx.type = `image/${processedImage.format}`;
  ctx.body = processedImage.buffer;
});

router.get('*', async (ctx, next) => {
  const qs = ctx.request.query;

  if (!qs.file) {
    ctx.status = 404;
    ctx.body = 'Parameter [file] must be specified in the URL query string';
    return;
  }

  const imagePath = path.join(basePath, qs.file);

  // check the file is in a valid location
  if (imagePath.indexOf(basePath) !== 0) {
    ctx.status = 403;
    ctx.body = 'File outside of allowed base path';
    return;
  }

  // check the file is of a valid type
  if (allowedFileExtensions.indexOf(path.extname(imagePath)) < 0) {
    ctx.status = 400;
    ctx.body = `File type not in allowed list: ${allowedFileExtensions.join(', ')}`;
    return;    
  }

  // check the file exists
  if (!fs.existsSync(imagePath)) {
    ctx.status = 404;
    ctx.body = 'File  not found';
    return;    
  }

  const image = new Image(imagePath);

  let { processes, options } = parseContext(ctx);

  let processedImage = await image.process(processes, options);

  ctx.status = 200;
  ctx.type = `image/${processedImage.format}`;
  ctx.body = processedImage.buffer;
  
  try {
    const size = imageSize(processedImage.buffer);
    ctx.set({
      'X-Image-Width': size.width,
      'X-Image-Height': size.height
    });
  } catch (e) {
    console.log(`Could not set width and height headers: ${e}`);
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

// listen on the specified port
app.listen(3000);