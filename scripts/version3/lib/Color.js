/**
 * Structure capturing color properties (r,g,b,a)
 */

export class Color {

    /**
     * 
     * @param {Number} [r] value 0 - 255
     * @param {Number} [g] value 0 - 255
     * @param {Number} [b] value 0 - 255 
     * @param {Number} [a] value 0 - 255 
     */
    constructor(r, g, b, a) {
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.a = a || 255;
    }

    /**
     * Copies the values of the other color
     * @param {Color} other 
     * @returns this
     */
    copy(other) {
        if (other) {
            this.r = other.r;
            this.g = other.g;
            this.b = other.b;
            this.a = other.a;
        }

        return this;
    }
}