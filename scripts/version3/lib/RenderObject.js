import { Quaternion } from "./Quaternion.js";
import { Vector3 } from "./Vector3.js";

export class RenderObject {

    constructor(data, translation, rotation) {
        this.renderData = data;
        this.translation = translation || new Vector3();
        this.rotation = rotation || new Quaternion();
        // toEuler isn't returning a single consistent solution, so 
        // store the euler angles separately
        this.euler = Quaternion.toEuler(this.rotation);
    }
}