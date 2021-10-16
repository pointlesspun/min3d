import { Vector3 } from "./Vector3.js";
import { Matrix44 } from "./Matrix44.js";

/**
 * General dumping ground for math functions that don't fit anywhere else.
 */
export const MathX = {

    /**
     * Multiply the vector with the given matrix and return a new vector.
     * (also from https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix)
     *
     * @param {Vector3} vector 
     * @param {Matrix44} matrix 
     */
    multiplyVxM: function(vector, matrix) {

        var result = new Vector3(
            vector.x * matrix.values[0][0] + vector.y * matrix.values[1][0] + vector.z * matrix.values[2][0] + matrix.values[3][0],
            vector.x * matrix.values[0][1] + vector.y * matrix.values[1][1] + vector.z * matrix.values[2][1] + matrix.values[3][1],
            vector.x * matrix.values[0][2] + vector.y * matrix.values[1][2] + vector.z * matrix.values[2][2] + matrix.values[3][2],
        );

        var w = vector.x * matrix.values[0][3]
                + vector.y * matrix.values[1][3]
                + vector.z * matrix.values[2][3]
                + matrix.values[3][3];

        return (w != 1) ? result.div(w) : result;
    }
}