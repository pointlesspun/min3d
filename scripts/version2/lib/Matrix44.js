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
    projectionAngle(angle, near, far) {
        const scale = 1 / Math.tan(angle * 0.5 * Math.PI / 180);

        this.identity();

        this.values[0][0] = scale;
        this.values[1][1] = scale;
        this.values[2][2] = -far / (far-near);
        this.values[3][2] = -far * near / (far-near);
        this.values[2][3] = -1;
        this.values[3][3] = 0;

        return this;
    }

    // ref stackoverflow somewhere...
    projectionFoV(fov, aspect, near, far, leftHanded )
    {
        //
        // General form of the Projection Matrix
        //
        // uh = Cot( fov/2 ) == 1/Tan(fov/2)
        // uw / uh = 1/aspect
        // 
        //   uw         0       0       0
        //    0        uh       0       0
        //    0         0      f/(f-n)  1
        //    0         0    -fn/(f-n)  0
        //
        // Make result to be identity first
    

        this.identity();
   
        if (fov > 0 && aspect > 0 ) {
            const frustumDepth = far - near;
            const oneOverDepth = 1 / frustumDepth;
        
            this.values[1][1] = 1 / Math.tan(0.5 * fov * Math.PI / 180.0);
            this.values[0][0] = (leftHanded ? 1 : -1 ) * this.values[1][1] / aspect;
            this.values[2][2] = far * oneOverDepth;
            this.values[3][2] = (-far * near) * oneOverDepth;
            this.values[2][3] = -1;
            this.values[3][3] = 0;
        }

        return this;
    }
}