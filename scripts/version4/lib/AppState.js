import { Color } from "./Color.js";
import { Vector3 } from "./Vector3.js";

/**
 * User adjustable settings for the rasterizer demo.
 */
export class Appstate {

    /**
     * Resolution in pixels of the raster buffer
     * @type {Vector3}
    */
    resolution = new Vector3(320, 200, 0);

    /**
     * Colors will be multiplied with x*r, y*r, z*b
     * @type {Vector3}
     */
    colorMultiplier = new Vector3(1, 1, 1);

    /** 
     * Max width of the randomized scanlines
     * @type {number}
     */
    maxScanlineWidth = 3;

    /**
     * Update time in ms
     * @type {Number}
     */
    updateInterval = 1000/30;
}