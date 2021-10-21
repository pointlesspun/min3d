
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
     * Array of Vector3s representing the normals of the vertices on the faces (currently not used) 
     *     */
     normals = [];


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


    objectCenter = new Vector3();

    boundsSpan() {
        return this.bounds.max.subVector(this.bounds.min);
    }

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
            else if (line.startsWith("vn ")) {
                // ignore for now, we're not using this
                // this.parseVertexNormals(line);
            }
            else if (line.startsWith("f ")) {
                this.parseFace(line);
            }
        }

        this.objectCenter = this.boundsCenter();

        return this;
    }

    parseVector(line) {
        let numbers = line.split(' ').filter( s => s && s !== ' ' && s !== 'v' && s !== '\r');
        let vector = new Vector3(parseFloat(numbers[0]), parseFloat(numbers[1]), parseFloat(numbers[2]));

        this.bounds.min = this.bounds.min.min(vector);
        this.bounds.max = this.bounds.max.max(vector);

        this.vertices.push(vector);
    }

    parseVertexNormals(line) {
        let numbers = line.split(' ').filter( s => s && s !== ' ' && s !== 'vn' && s !== '\r');
        let vector = new Vector3(parseFloat(numbers[0]), parseFloat(numbers[1]), parseFloat(numbers[2]));

        this.normals.push(vector);
    }

    parseFace(line) {
        const faceIndices = line.split(' ').filter( s => s && s !== '\r' && s !== 'f');
        if (faceIndices.length <= 4) {
            const faceElements = faceIndices.map( str => this.parseFaceProperties(str) );

            const v1 = this.vertices[faceElements[0].vertex];
            const v2 = this.vertices[faceElements[1].vertex];
            const v3 = this.vertices[faceElements[2].vertex];
            const v4 = faceElements.length === 4 ? this.vertices[faceElements[3].vertex] : null;

            const v1_v2 = v2.subVector(v1).normalized();
            const v2_v3 = v3.subVector(v2).normalized();

            const normal = v1_v2.cross(v2_v3);
                               
            const centroid = faceIndices.length === 3 
                        ? MathX.triangleCentroid(v1, v2, v3)
                        : MathX.quadCentroid(v1, v2, v3, v4);

            this.faces.push(new Face(faceElements.map( data => data.vertex), normal, centroid));
        }
    }


    parseFaceProperties(input) {
        var values = input.split('/');
    
        return {
            vertex: parseInt(values[0]) - 1,
            texture: values.length > 1 ? parseInt(values[1]) - 1 : -1,
            // vertex normal - ignore for now
            // normal: values.length > 2 ?  parseInt(values[2]) - 1 : -1
        };
    }    
}