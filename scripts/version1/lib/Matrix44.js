/**
 * Implements a 4 by 4 Matrix (similar to http://www.songho.ca/opengl/gl_matrix.html)
 */
export class Matrix44 {

    constructor() {
        this.values = Array(4).fill(Array(4).fill(0));
    }

    /**
     * Turns this matrix into an identity matrix
     * @returns this (matrix)
     */
    identity() {
        this.values[0] = [1, 0, 0, 0];
        this.values[1] = [0, 1, 0, 0];
        this.values[2] = [0, 0, 1, 0];
        this.values[3] = [0, 0, 0, 1];
      
        return this;
    }

    /**
     * Turns this matrix into a projection matrix
     * ref: https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix
     * @param {number} angle 
     * @param {number} near 
     * @param {number} far 
     * @returns this (matrix)
     */
    projection(angle, near, far) {
        const scale = 1 / Math.tan(angle * 0.5, Math.PI / 180);

        this.identity();

        this.values[0][0] = scale;
        this.values[1][1] = scale;
        this.values[2][2] = -far / (far-near);
        this.values[3][2] = -far * near / (far-near);
        this.values[2][3] = -1;
        this.values[3][3] = 0;

        return this;
    }
}