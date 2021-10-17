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
        return Math.sqrt(x*x + y * y + z * z + w * w);
    }

    normalized() {
        var mag = this.magnitude();

        if (mag !== 0) {
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
} 