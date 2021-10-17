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
    },

    toRadians : (angle) => (angle * Math.PI) / 180,

    toAngles: (rad) => rad * (180 / Math.PI),

    rotate: (value, rotation) => {
            const num12 = rotation.x + rotation.x;
            const num2 = rotation.y + rotation.y;
            const num = rotation.z + rotation.z;
            const num11 = rotation.w * num12;
            const num10 = rotation.w * num2;
            const num9 = rotation.w * num;
            const num8 = rotation.x * num12;
            const num7 = rotation.x * num2;
            const num6 = rotation.x * num;
            const num5 = rotation.y * num2;
            const num4 = rotation.y * num;
            const num3 = rotation.z * num;
            const num15 = ((value.x * ((1 - num5) - num3)) + (value.y * (num7 - num9))) + (value.z * (num6 + num10));
            const num14 = ((value.x * (num7 + num9)) + (value.y * ((1 - num8) - num3))) + (value.z * (num4 - num11));
            const num13 = ((value.x * (num6 - num10)) + (value.y * (num4 + num11))) + (value.z * ((1 - num8) - num5));

            return new Vector3(num15, num14, num13);
        }

}