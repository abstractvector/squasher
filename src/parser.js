import { URL } from 'url';

const parseContext = (ctx) => {
  let url = new URL(ctx.request.href);

  // parse out which processes we want to apply to the image
  let processes = url.pathname.split('/').filter(v => !!v).map(v => {
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

  let options = {
    supportedTypes: [
      ctx.accepts('image/jpeg') ? 'jpeg' : null,
      ctx.accepts('image/png') ? 'png' : null,
      //ctx.request.header.accept.indexOf('image/webp') > -1 ? 'webp' : null
    ].filter(v => null !== v)
  }

  if (options.supportedTypes.length === 0) {
    options.supportedTypes.push('jpeg');
  }

  return { processes, options };
}

export default parseContext;