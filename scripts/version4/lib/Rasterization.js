import { Color } from "./Color.js";
import { MathX } from "./MathX.js";
import { definedOrDefault } from "./types.js";

/**
 * Structure capturing the values of a single raster element (pixel)
 */
export class RasterElement {
    r = 0;
    g = 0;
    b = 0;
    a = 0; 
    z = 0;
    length = 1;

    /**
     * Sets the color part of this element
     * @param {Color} color 
     */
    setColor(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }

    /**
     * Sets all the properties of this element.
     * @param {Color} color 
     * @param {number} z 
     * @param {number} length 
     */
    set(color, z, length) {
        this.setColor(color);
        this.z = z;
        this.length = length;
    }

    /** 
     * Turns the color elements into a rgb string
     * @returns {string} of the format rgb(r,g,b)
     */
    getRgbString() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }
}

/**
 * Utility which uses buffers to rasterize graphics and move these rasterized
 * graphics to a canvas
 */
export class Rasterization {

    /**
     * 
     * @param {string} canvasId id of the canvas element 
     * @param {number} [bufferWidth=640] width in pixels of the rasterization buffers  
     * @param {number} [bufferHeight=480]  height in pixels of the rasterization buffers
     * @param {number} [bufferCount=2] number of buffers used
     */
    constructor(canvasId, bufferWidth, bufferHeight, bufferCount) {
        this.canvas = document.getElementById(canvasId);
        
        /** @type {CanvasRenderingContext2D} */
        this.context = this.canvas.getContext("2d");

        /** @type {RasterElement[][]} */
        this.buffers = [];

        /** @type {number} */
        this.currentBufferIdx = 0;

        const count = definedOrDefault(bufferCount, 2);
        const width = definedOrDefault(bufferWidth, 640);
        const height = definedOrDefault(bufferHeight, 480);

        /** @type {number} */
        this.bufferWidth = width;

        /** @type {number} */
        this.bufferHeight = height;

        for (let i = 0; i < count; i++) {            
            this.buffers.push(this.createBuffer(width, height));
        }

        /** @type {number} */
        this.pixelWidth = this.canvas.width / this.bufferWidth;

        /** @type {number} */
        this.pixelHeight = this.canvas.height / this.bufferHeight;
    }

    /**
     * Adds a (scan) line starting at the given position. Will be clipped against 
     * buffer boundaries
     * 
     * @param {number} startX 
     * @param {number} startY 
     * @param {number} length 
     * @param {Color} color 
     */
    addScanLine(startX, startY, length, color) {

        const x = Math.floor(MathX.clamp(startX, 0, this.bufferWidth-1));
        const y = Math.floor(MathX.clamp(startY, 0, this.bufferHeight-1));
        const len = Math.floor(MathX.clamp(startX + length, 0, this.bufferWidth) - startX);
        const buffer = this.buffers[this.currentBufferIdx];
        const rasterElement = buffer[this.getBufferIndex(x, y)];
         
        rasterElement.set(color, 0, len);
    }

    /**
     * Render the current write buffer to the canvas
     * @returns {this}
     */
    render() {
        const buffer = this.buffers[this.currentBufferIdx];
        const w = this.bufferWidth;
        const h = this.bufferHeight;

        const scanlineH = this.pixelHeight;

        for (let y = 0; y < h; y++) {
            let x = 0;
            let scanlineY = y * this.pixelHeight;
        
            while (x < w) {
                let idx = x + y * w;
                let element = buffer[idx];
                if (element.length && element.a) {
                    let scanlineX = x * this.pixelWidth;                   
                    let scanlineW = element.length * this.pixelWidth;

                    this.context.fillStyle = element.getRgbString();
                    this.context.fillRect(scanlineX, scanlineY, scanlineW+1, scanlineH+1);
                    x += element.length;
                } else {
                    x++;
                }
            }
        }

        return this;
    }    

    /**
     * Switches the current write buffer to the next available buffer
     * @returns {this}
     */
    switchBuffer() {
        this.currentBufferIdx = (this.currentBufferIdx + 1) % this.buffers.length;
        return this;
    }
    
    /**
     * Maps the x y value on an index in the buffers
     * @private
     * @param {number} x a value between 0 and this.bufferWidth
     * @param {number} y a value between 0 and this.bufferHeight
     * @returns {number} the bufferindex
     */
    getBufferIndex(x, y) {
        return x + y * this.bufferWidth;
    }
    
    /**
     * Create a w x h array of RasterElements
     * @private
     */
    createBuffer(w, h) {
        const bufferSize = w * h;
        const buffer = new Array(bufferSize);

        for (let i = 0; i < bufferSize; i++) {
            buffer[i] = new RasterElement();
        }

        return buffer;
    }
}