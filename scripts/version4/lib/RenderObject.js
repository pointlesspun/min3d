import { Quaternion } from "./Quaternion.js";
import { Vector3 } from "./Vector3.js";
import { WaveFrontObject } from "./WaveFrontObject.js";

/**
 * Contains the object's transform properties and the render data 
 */
export class RenderObject {

    constructor(data, translation, rotation) {
        /** @type {WaveFrontObject} */
        this.renderData = data;

        /** @type {Vector3} */
        this.translation = translation || new Vector3();

        /** @type {Quaternion} */
        this.rotation = rotation || new Quaternion();
        
        /** @type {Vector3} */
        // toEuler isn't returning a single consistent solution, so 
        // store the euler angles separately
        this.euler = Quaternion.toEuler(this.rotation);
    }
}