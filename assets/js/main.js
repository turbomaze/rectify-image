class Rectifier {
  constructor(source, destination) {
    this.source = source;
    this.destination = destination;
    this.imageData = null;
    this.rectifyCallArguments = null;

    this.source.onload = this.getSourceImageData.bind(this);
  }

  getSourceImageData() {
    // get the source's pixels
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const { width, height } = this.source;
    canvas.width = width;
    canvas.height = height;
    context.drawImage(this.source, 0, 0, width, height);
    this.imageData = context.getImageData(0, 0, width, height);

    // if rectify was already called, rectify the image
    if (this.rectifyCallArguments) {
      this.rectify.apply(this, this.rectifyCallArguments);
    }
  }

  /*
   * rectify()
   * Output the rectified source img to the destination img.
   *
   * @param {number} width -- width of the destination image
   * @param {number} height -- height of the destination image
   *
   */
  rectify(width, height) {
    // deal with async safety
    this.rectifyCallArguments = [width, height];
    if (!this.imageData) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const destinationData = context.getImageData(0, 0, width, height);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = 4 * (i * width + j);
        destinationData.data[index + 0] = this.imageData.data[index + 0];
        destinationData.data[index + 1] = this.imageData.data[index + 1];
        destinationData.data[index + 2] = this.imageData.data[index + 2];
        destinationData.data[index + 3] = this.imageData.data[index + 3];
      }
    }

    context.putImageData(destinationData, 0, 0);
    const dataUrl = canvas.toDataURL();
    this.destination.width = width;
    this.destination.height = height;
    this.destination.src = dataUrl;
  }
}
