rectify-image
==

Do you have images distorted by perspective projections? Just include `assets/js/rectifyImage.js` in your website and magically fix them with just a few lines of javascript.

![example-rectified-image](https://raw.githubusercontent.com/turbomaze/rectify-image/master/demo.png)

## Usage

All you need to do is include the following file in your page and use it like so:

```
<script src="./assets/js/rectifyImage.js"></script>
<script>
window.addEventListener('DOMContentLoaded', () => {
  // grab the source and destination img tags
  const source = document.querySelector('#source'); // source image
  const destination = document.querySelector('#destination');

  // your data goes here; corners start at top left and go clockwise
  const rectifier = new Rectifier(source, destination);
  const destinationWidth = 500;
  const destinationHeight = 329;
  const sourceCorners = [
    { x: 841, y: 505 },
    { x: 1542, y: 777 },
    { x: 1546, y: 1183 },
    { x: 838, y: 1117 },
  ];

  // this draws the rectified image to the destination img tag
  rectifier.rectify(destinationWidth, destinationHeight, sourceCorners);
})
</script>
```

## License

MIT License: https://igliu.mit-license.org
