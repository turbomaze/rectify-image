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
   * @param {number} width  -- width of the destination image
   * @param {number} height -- height of the destination image
   * @param {{x: number, y:number}[4]} points -- the source image corners
   *
   */
  getProjectionMatrix(width, height, points) {
    if (this.points < 4) return { x: 0, y: 0 };

    const { x: x0, y: y0 } = points[0];
    const { x: x1, y: y1 } = points[1];
    const { x: x2, y: y2 } = points[2];
    const { x: x3, y: y3 } = points[3];
    return [
      [x1 - x0, x3 - x0, x0 + x2 - (x1 + x3), x0],
      [y1 - y0, y3 - y0, y0 + y2 - (y1 + y3), y0],
    ];
  }

  /*
   * dotProduct()
   * Return the dot product of the vectors represented by the input arrays.
   *
   * @param {number[]} A
   * @param {number[]} B
   *
   */
  dotProduct(A, B) {
    return A.reduce((accumulator, value, index) => {
      return accumulator + value * B[index];
    }, 0);
  }

  /*
   * projectPoint()
   * Return the projection
   *
   * @param {number[2][4]} T -- the projection matrix
   * @param {number} xPercent -- the x coordinate as a percentage of width
   * @param {number} yPercent -- the y coordinate as a percentage of height
   *
   */
  projectPoint(T, xPercent, yPercent) {
    const point = [xPercent, yPercent, xPercent * yPercent, 1];
    return {
      x: Math.floor(this.dotProduct(T[0], point)),
      y: Math.floor(this.dotProduct(T[1], point)),
    };
  }

  /*
   * rectify()
   * Output the rectified source img to the destination img.
   *
   * @param {number} width -- width of the destination image
   * @param {number} height -- height of the destination image
   * @param {{x: number, y:number}[4]} points -- the source image corners, clockwise
   *
   */
  rectify(width, height, points) {
    // deal with async safety
    this.rectifyCallArguments = Array.from(arguments);
    if (!this.imageData) return;

    // make the image data for the destination canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const destinationData = context.getImageData(0, 0, width, height);

    // map the destination points to the source image data
    const T = this.getProjectionMatrix(width, height, points);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const { x: sourceX, y: sourceY } = this.projectPoint(T, x / width, y / height);
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
