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
   * getProjectionMatrix()
   * Return the matrix that maps destination points to source points.
   *
   * @param {number} width -- width of the destination image
   * @param {number} height -- height of the destination image
   *
   */
  getProjectionMatrix(width, height) {
    return [[1, 0, 0, 0], [0, 1, 0, 0]];
  }

  /*
   * projectPoint()
   * Return the projection
   *
   * @param {array[2][4]} T -- the projection matrix
   * @param {number} x -- the x coordinate
   * @param {number} y -- the y coordinate
   *
   */
  projectPoint(T, x, y) {
    return { x, y };
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

    // make the image data for the destination canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const destinationData = context.getImageData(0, 0, width, height);

    // map the destination points to the source image data
    const T = this.getProjectionMatrix(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const { x: sourceX, y: sourceY } = this.projectPoint(T, x, y);
        const index = 4 * (y * width + x);
        const sourceIndex = 4 * (sourceY * this.source.width + sourceX);
        destinationData.data[index + 0] = this.imageData.data[sourceIndex + 0];
        destinationData.data[index + 1] = this.imageData.data[sourceIndex + 1];
        destinationData.data[index + 2] = this.imageData.data[sourceIndex + 2];
        destinationData.data[index + 3] = this.imageData.data[sourceIndex + 3];
      }
    }

    // render the projected data as an img
    context.putImageData(destinationData, 0, 0);
    const dataUrl = canvas.toDataURL();
    this.destination.width = width;
    this.destination.height = height;
    this.destination.src = dataUrl;
  }
}
