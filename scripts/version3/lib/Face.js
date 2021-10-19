import { Vector3 } from "./Vector3.js";

/**
 * Face of a mesh model (it's just a polygon but let's stick with the WaveFront nomenclature)
 */
export class Face {

    /**
     * 
     * @param {int[]} indices either of length 3 (triangles) or 4 (quads)
     * @param {Vector3} normal 
     */
    constructor(indices, normal, centroid) {
        this.indices = indices;
        this.normal = normal;
        this.centroid = centroid;
    }
}