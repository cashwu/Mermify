declare module 'upng-js' {
  interface Frame {
    rect: { x: number; y: number; width: number; height: number };
    delay: number;
    dispose: number;
    blend: number;
  }

  interface Image {
    width: number;
    height: number;
    depth: number;
    ctype: number;
    frames: Frame[];
    tabs: Record<string, unknown>;
    data: ArrayBuffer;
  }

  /**
   * Decodes a PNG/APNG file
   */
  function decode(buffer: ArrayBuffer): Image;

  /**
   * Returns the pixels of the image as RGBA
   */
  function toRGBA8(image: Image): ArrayBuffer[];

  /**
   * Encodes frames into APNG
   * @param frames - Array of RGBA data (ArrayBuffer)
   * @param width - Image width
   * @param height - Image height
   * @param cnum - Number of colors (0 = lossless)
   * @param delays - Array of delays in milliseconds for each frame
   */
  function encode(
    frames: ArrayBuffer[],
    width: number,
    height: number,
    cnum: number,
    delays?: number[]
  ): ArrayBuffer;

  /**
   * Encodes a single PNG image
   */
  function encodeLL(
    frames: ArrayBuffer[],
    width: number,
    height: number,
    colorDepth: number,
    colorType: number,
    delays?: number[]
  ): ArrayBuffer;

  export { decode, toRGBA8, encode, encodeLL, Image, Frame };
  export default { decode, toRGBA8, encode, encodeLL };
}
