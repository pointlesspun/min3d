
import { Face } from "./Face.js";
import { MathX } from "./MathX.js";
import { Vector3 } from "./Vector3.js";

/**
 * Allows importing a wavefront file, see https://en.wikipedia.org/wiki/Wavefront_.obj_file
 */
export class WaveFrontObject {

    /**
     * Array of Vector3s representing the vertices of an object
     */
    vertices = [];
    
    /**
     * Array of indices, either of length 3 (triangles) or 4 (quads)
     * @type {Face[]}
     */
    faces = [];


    /**
     * Bounding box expressed by a min and max vector
     */
    bounds = {
        min : new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
        max : new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE)
    };

    /**
     * Center of the model based on the its span. This may be modified
     */
    objectCenter = new Vector3();

    /**
     * 
     * @returns {Vector3} which is the bounds max - min
     */
    boundsSpan() {
        return this.bounds.max.subVector(this.bounds.min);
    }

    /**
     * 
     * @returns {Vector3} center of the bounds
     */
    boundsCenter() {
        return this.bounds.min.addVector(this.boundsSpan().div(2));
    }

    /**
     * Parse the given text (which is assumed to be proper WaveFrontData)
     * @param {string} text 
     */
    parse(text) {
        var lineArray = text.split('\n');

        for (let line of lineArray)
        {
            if (line.startsWith("v ")) {
                this.parseVector(line);
            }
            else if (line.startsWith("f ")) {
                this.parseFace(line);
            }
        }

        this.objectCenter = this.boundsCenter();

        return this;
    }

    /**
     * Reads a vector from the string adding it to the vertices and updating the bounds
     * @param {string} line 
     * @private
     */
    parseVector(line) {
        let numbers = line.split(' ').filter( s => s && s !== ' ' && s !== 'v' && s !== '\r');
        let vector = new Vector3(parseFloat(numbers[0]), parseFloat(numbers[1]), parseFloat(numbers[2]));

        this.bounds.min = this.bounds.min.min(vector);
        this.bounds.max = this.bounds.max.max(vector);

        this.vertices.push(vector);
    }

    /**
     * Reads a face from the string adding it to the faces
     * @param {string} line 
     * @private
     */
    parseFace(line) {
        const faceIndices = line.split(' ').filter( s => s && s !== '\r' && s !== 'f');
        if (faceIndices.length <= 4) {
            const vertexIndices = faceIndices.map( str => this.parseFaceIndex(str) );

            const v1 = this.vertices[vertexIndices[0]];
            const v2 = this.vertices[vertexIndices[1]];
            const v3 = this.vertices[vertexIndices[2]];
            const v4 = vertexIndices.length === 4 ? this.vertices[vertexIndices[3]] : null;

            const v1_v2 = v2.subVector(v1).normalized();
            const v2_v3 = v3.subVector(v2).normalized();

            const normal = v1_v2.cross(v2_v3);
                               
            const centroid = faceIndices.length === 3 
                        ? MathX.triangleCentroid(v1, v2, v3)
                        : MathX.quadCentroid(v1, v2, v3, v4);

            this.faces.push(new Face(vertexIndices, normal, centroid));
        }
    }


    /**
     * Reads the vertex index of a face from the string
     * @private 
     * @param {string} input 
     * @returns {number} vertex index 
     */
    parseFaceIndex(input) {
        return parseInt(input.split('/')[0] - 1);
    }    
}