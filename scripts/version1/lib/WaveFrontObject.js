
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
     */
    faceVertexIndices = [];

    /**
     * Array of Vector3s representing the normals of the faces
     */
    normals = [];

    /**
     * Bounding box expressed by a min and max vector
     */
    bounds = {
        min : new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
        max : new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE)
    };

    /**
     * Parse the given text (which is assumed to be proper WaveFrontData)
     * @param {string} text 
     */

    parse(text) {
        var lineArray = text.split('\n');
        
        for (let line of lineArray)
        {
            if (line.startsWith("v ")) {
                let numbers = line.split(' ').filter( s => s && s !== ' ' && s !== 'v' && s !== '\r');
                let vector = new Vector3(parseFloat(numbers[0]), parseFloat(numbers[1]), parseFloat(numbers[2]));

                this.bounds.min = this.bounds.min.min(vector);
                this.bounds.max = this.bounds.max.max(vector);

                this.vertices.push(vector);
            }
            else if (line.startsWith("f ")) {
                let faceIndices = line.split(' ').filter( s => s && s !== '\r' && s !== 'f');
                let faceElements = faceIndices.map( str => this.parseFace(str) );
                
                this.faceVertexIndices.push(faceElements.map( data => data.vertex));
            }
        }

        return this;
    }

    parseFace(input) {
        var values = input.split('/');
    
        return {
            vertex: parseInt(values[0]) - 1,
            texture: values.length > 1 ? parseInt(values[1]) - 1 : -1,
            normal:values.length > 2 ?  parseInt(values[2]) - 1 : -1
        };
    }    
}