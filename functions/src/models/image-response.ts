/**
 * Image Model to be used as response of image creation model
 * @module MyClass
 */
export class ImageResponse {
  /**
   * Constructor of Image Model
   * @argument {string | undefined} imageUrl Url of the image.
   */
  constructor(imageUrl: string | undefined) {
    this.url = imageUrl;
  }
  url: string | undefined;
}
