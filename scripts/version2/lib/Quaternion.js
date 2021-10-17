import {Vector3} from "./Vector3.js";
import {MathX} from "./MathX.js";

export class Quaternion {

    x = 0;
    y = 0;
    z = 0;
    w = 1;

    constructor(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
    }

    magnitude() {
        return Math.sqrt(this.x*this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    normalized() {
        var mag = this.magnitude();

        // near 0 ?
        if (mag > -0.0000001 && mag < 0.0000001) {
            // return identity
            return new Quaternion();
        }

        return new Quaternion(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
    }

    mult(other) {
        return Quaternion.multiply(this, other);
    }
    



    static multiply(q1, q2) {
        return new Quaternion(
            q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x,
            -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y,
            q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z,
            -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w
        );
    }

    /**
     * 
     * @param {Vector3} angles 
     * @returns 
     */
    static fromEuler(angles) {
        const xAngles = Quaternion.fromAxisAngle(Vector3.right, MathX.toRadians(angles.x));
        const yAngles = Quaternion.fromAxisAngle(Vector3.up, MathX.toRadians(angles.y));
        const zAngles = Quaternion.fromAxisAngle(Vector3.forward, MathX.toRadians(angles.z));

        return xAngles.mult(yAngles).mult(zAngles);
    }

    static fromAxisAngleEuler(axis, angle) {
       return Quaternion.fromAxisAngle(axis, MathX.toRadians(angle));
    }

    static fromAxisAngle(axis, angle) {
        var s = Math.sin(angle / 2);
        return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(angle / 2));
    }

    // from http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/
    static toEuler(quaternion) {
        let x = 0;
        let y = 0;
        let z = 0;
        const test = quaternion.x*quaternion.y + quaternion.z*quaternion.w;

        if (test > 0.499) { // singularity at north pole
            y = 2 * Math.atan2(quaternion.x,quaternion.w);
            x  = Math.PI/2;
        }
        else if (test < -0.499) { // singularity at south pole
            y = -2 * Math.atan2(quaternion.x,quaternion.w);
            x = - Math.PI/2;
        }
        else {
            const sqx = quaternion.x*quaternion.x;
            const sqy = quaternion.y*quaternion.y;
            const sqz = quaternion.z*quaternion.z;
            y = Math.atan2(2*quaternion.y*quaternion.w-2*quaternion.x*quaternion.z , 1 - 2*sqy - 2*sqz);
            x = Math.asin(2*test);
            z = Math.atan2(2*quaternion.x*quaternion.w-2*quaternion.y*quaternion.z , 1 - 2*sqx - 2*sqz);
        }

        return new Vector3(x,y,z);
    }
} 