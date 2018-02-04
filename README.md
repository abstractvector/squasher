# Squash
Simple HTTP endpoint to squash images - designed to run as a Docker container, but can run standalone

## Installation

Since the module is not yet available on `npm`, you must install this manually using `git`, for instance:

```bash
$ npm install abstractvector/squasher
```

Squash exposes an HTTP server on port 3000.

## Usage

The HTTP endpoint exists at the root `/` and expects to be `POST`ed an image file. You should ensure that the `Content-Type` header is correct.

For a very simple usage, you can use `curl`:

```bash
$ curl -v \
       -H 'Content-Type: image/jpeg' \
       -H 'Accept: image/webp,image/apng,image/*,*/*;q=0.8' \
       --data-binary @/path/to/my/image.jpg \
       http://localhost:3000 1>/dev/null
```

### Image Formats

Squasher will use the `Accept` header to decide what image type to return - it will return the smallest file size of the available image type: JPEG, PNG or WebP.

Because many browsers specify `image/*` in their `Accept` header but don't actually support `image/webp`, Squasher does a strict check looking for `image/webp` to be explicitly stated. If `image/webp` is not explicitly stated then it is assumed that the client does *not* support WebP. JPEG and PNG support are still allowed by `image/*` however.

## Operations

Operations are available to manipulate the image before it is returned. These are specified on the URL and you can chain multiple together.

### Size

Format: `/size=<width>x<height>`

Example|Action
---|---
`/size=300x200`|Resizes the image to a maximum of 300x200, cropping if it exceeds this
`/size=300`|Resizes the width to 300px whilst retaining the aspect ratio
`/size=x200`|Resizes the height to 200px whilst retaining the aspect ratio

# To Do
- Add unit tests
- Document crop feature
- Add more image manipulation features
- Improve error handling
- Allow configuration, especially for compression
- Support restrictions for allowed operations
- Add caching  