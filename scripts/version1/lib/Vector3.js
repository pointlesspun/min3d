/**
 * Implementation of a minimal 3d vector
 */
export class Vector3 {

    x = 0;
    y = 0; 
    z = 0;
    
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Divide the elements by f
     * @param {number} f 
     * @returns a new vector with x/f, y/f, z/f
     */
    div(f) {
        return new Vector3(this.x / f, this.y / f, this.z / f);
    }

    /**
     * Add the elements of the other vector
     * @param {Vector3} other 
     * @returns a new vector with x+other.x, y+other.y, z+other.y
     */
    addVector(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    /**
     * Subtracts the elements of the other vector
     * @param {Vector3} other 
     * @returns a new vector with x-other.x, y-other.y, z-other.y
     */
    subVector(other) {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    /**
     * Add the provided values 
     * @param {Vector3} other 
     * @returns a new vector with the added values
     */
    add(x, y, z) {
        return new Vector3(this.x + x, this.y + y, this.z + z);
    }

    /**
     * Subtract the provided values 
     * @param {Vector3} other 
     * @returns a new vector with the subtracted values
     */
    sub(x, y, z) {
        return new Vector3(this.x - x, this.y - y, this.z - z);
    }
    
    /**
     * Returns a new vector with the min value of the both vectors 
     * @param {Vector3} other 
     * @returns a new vector
     */
    min(other) {
        return new Vector3(Math.min(this.x, other.x), Math.min(this.y, other.y), Math.min(this.z, other.z));
    }

    /**
     * Returns a new vector with the max value of the both vectors 
     * @param {Vector3} other 
     * @returns a new vector
     */
    max(other) {
        return new Vector3(Math.max(this.x, other.x), Math.max(this.y, other.y), Math.max(this.z, other.z));
    }
}