import sharp from 'sharp';

class Image {

  constructor(buffer) {
    this.originalSize = buffer.byteLength;
    this.original = sharp(buffer);
  }

  async process(process = [], options) {
    let clone = this.original.clone();
    this.originalMetadata = await clone.metadata();

    process.forEach(p => {
      this.do(clone, p.process, p.options);
    });

    const result = (await Promise.all(options.supportedTypes.map(async f => {
      let opts = {};

      if ('jpeg' === f) {
        opts.quality = 90;
        opts.progressive = true;
      }

      if ('png' === f) {
        opts.progressive = true;
      }
      
      const c = clone.clone().toFormat(f, opts);
      const b = await new Promise((resolve, reject) => {
          c.toBuffer((err, data, info) => {
            if (err) { return reject(err); }

            return resolve({
              buffer: data,
              metadata: info
            });
        });
      });

      return { image: c, format: f, buffer: b.buffer, metadata: b.metadata };
    }))).reduce((p, c) => {
      return p.buffer.byteLength < c.buffer.byteLength ? p : c;
    });

    return result;
  }

  do(image, action, options) {
    switch (action) {
      case 'size':
        return image.resize(
          options.width || null,
          options.height || null
        );
      case 'crop':
        return image.crop(
          options.gravity || null
        );
    }
  }

}

export default Image;