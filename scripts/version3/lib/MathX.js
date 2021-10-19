import { Vector3 } from "./Vector3.js";
import { Matrix44 } from "./Matrix44.js";
import { Quaternion } from "./Quaternion.js";

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

    /** 
     * Turns the given angles into radians 
     * @param {number} angle
     * @returns {number}
     */
    toRadians : (angle) => (angle * Math.PI) / 180,

    /**
     * Turns the  given radians into Euler angles 
     * @param {number} rad
     * @returns {number}
     */
    toAngles: (rad) => rad * (180 / Math.PI),

    /**
     * Rotates a vector using the given quaternion
     * 
     * @param {Vector3} vector 
     * @param {Quaternion} quaternion 
     * @returns {Vector3} the rotated vector
     */
    rotate: (vector, quaternion) => {
            const num12 = quaternion.x + quaternion.x;
            const num2 = quaternion.y + quaternion.y;
            const num = quaternion.z + quaternion.z;
            const num11 = quaternion.w * num12;
            const num10 = quaternion.w * num2;
            const num9 = quaternion.w * num;
            const num8 = quaternion.x * num12;
            const num7 = quaternion.x * num2;
            const num6 = quaternion.x * num;
            const num5 = quaternion.y * num2;
            const num4 = quaternion.y * num;
            const num3 = quaternion.z * num;
            const num15 = ((vector.x * ((1 - num5) - num3)) + (vector.y * (num7 - num9))) + (vector.z * (num6 + num10));
            const num14 = ((vector.x * (num7 + num9)) + (vector.y * ((1 - num8) - num3))) + (vector.z * (num4 - num11));
            const num13 = ((vector.x * (num6 - num10)) + (vector.y * (num4 + num11))) + (vector.z * ((1 - num8) - num5));

            return new Vector3(num15, num14, num13);
        },

        triangleCentroid: (v1, v2, v3) => {
            return new Vector3(
                (v1.x + v2.x + v3.x) / 3,
                (v1.y + v2.y + v3.y) / 3,
                (v1.z + v2.z + v3.z) / 3,
            )
        },

        quadCentroid: (v1, v2, v3, v4) => {
            if (!v4 || !v4.x) {
                console.log("v4 is ?");
            }

            return new Vector3(
                (v1.x + v2.x + v3.x + v4.x) / 4,
                (v1.y + v2.y + v3.y + v4.y) / 4,
                (v1.z + v2.z + v3.z + v4.z) / 4,
            )
        },

}