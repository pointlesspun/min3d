import { Face } from "./Face.js";
import { Quaternion } from "./Quaternion.js";
import { RenderObject } from "./RenderObject.js";
import { Vector3 } from "./Vector3.js";
import { MathX } from "./MathX.js";
import { Color } from "./Color.js";
import { Matrix44 } from "./Matrix44.js";

/**
 * Utility to render models (without actually drawing them, that's left up to the caller)
 */
export class ModelRenderer {

    /** 
     * @type {RenderObject}
     */
    renderObject = null;

    /**
     * Projection used to map world to screen coordinates
     * @type {Matrix44}
     */
    projection = null;

    /**
     * Faces which are visible to the camera 
     * @type {Face[]}
     */
    visibleFaces = null;

    /**
     * Light direction for flat sharing
     * @type {Vector3}
     */
    lightDirection = new Vector3(1, 1, 0).normalized();
    
    /**
     * Color of the light used
     * @type {Color}
     */
    lightColor = new Color(62, 42, 22);
    
    /**
     * Color of the rendered model
     * @type {Color}
     */
    modelColor = new Color(120, 150, 200);

    /**
     * Initializes rendering, storing variables which are used during the draw calls.
     * 
     * @param {RenderObject} renderObj 
     * @param {Matrix44} projection 
     * @param {Color} modelColor 
     * @param {Vector3} lightDirection 
     * @param {Color} lightColor 
     * @returns this
     */
    initialize(renderObj, projection, modelColor, lightDirection, lightColor) {
        this.renderObject = renderObj;
        this.projection = projection;
        
        this.modelColor.copy(modelColor);
        this.lightDirection.copy(lightDirection);
        this.lightColor.copy(lightColor);
        this.faceIdx = -1;

        return this;
    }

    /**
     * Only allow all faces from the setup which are visible
     * @returns this
     */
    filterVisibleFaces() {       
        
        this.visibleFaces = this.renderObject.renderData.faces.filter(f => {
            f.worldNormal = this.getWorldNormalIfFacing(f, this.renderObject);
            return f.worldNormal !== null;
        });

        return this;
    }

    /**
     * Sort all the visible faces back to front (for a (flawed) painter's algorithm)
     * @returns this
     */
    sortVisibleFaces() {
        const center = this.renderObject.renderData.objectCenter;

        this.visibleFaces.forEach(f => {
            var c2 = this.toWorld(f.centroid, center, this.renderObject.translation, this.renderObject.rotation);
            f.distanceToCamera = c2.lengthSquared();
        });

        this.visibleFaces.sort((f1, f2) => f2.distanceToCamera - f1.distanceToCamera);

        return this;
    }

    /**
     * Draw the model
     * @param {*} drawFunction a function which takes parameter r,g,b and a series of vertices 
     */
    draw(drawFunction) {
        this.drawVisibleFaces(0, this.lightColor, this.lightDirection, this.modelColor, drawFunction);
    }

    /**
     * Draw the model in iterations trying to limit the draws to the maximum time allowed
     * @param {*} drawFunction a function which takes parameter r,g,b and a series of vertices
     * @param {*} maxTime max allowed time in ms,  
     * @returns true if the model has been completely drawn, false otherwise
     */
    drawIteratively(drawFunction, maxTime) {

        if (this.faceIdx < 0) {
            this.faceIdx = 0;
        }

        const maxFaces = this.visibleFaces.length;
        var startTime = Date.now();
        var timeSpendDrawing = 0;
        while (this.faceIdx < maxFaces && timeSpendDrawing < maxTime) {
            this.faceIdx = this.drawVisibleFaces(this.faceIdx, this.lightColor, this.lightDirection, this.modelColor, drawFunction, 600);
            timeSpendDrawing = Date.now() - startTime;
        }
        
        return this.faceIdx >= maxFaces;
    }

    /**
     * Draw all faces that have been classified as visible by filterVisibleFaces
     * @private
     * @param {number} startIdx the first index of the visible faces to draw
     * @param {Color} lightColor 
     * @param {Vector3} lightDirection 
     * @param {Color} modelColor 
     * @param {*} drawFunction a function with the signature (r, g, b, polyVertices)
     * @param {number} maxDrawCalls the maximum number of faces that can be called or falsy if there is no limit
     * @returns {number} index of the last visible face drawn
     */
    drawVisibleFaces(startIdx, lightColor, lightDirection, modelColor, drawFunction, maxDrawCalls) {
        let idx = startIdx;
        let count = 0;

        while(idx < this.visibleFaces.length) {
            this.drawFace(this.visibleFaces[idx], lightColor, lightDirection, modelColor, drawFunction);
            idx++;

            if (maxDrawCalls) {
                count++;
                if (count >= maxDrawCalls) {
                    return idx;
                }
            }
        }

        return idx;
    }

    /**
     * Draw the given face if it's in screen space, with the current lighting
     * @param {Face} face 
     * @param {Vector3} lightDirection
     * @param {Color} lightColor 
     * @param {Color} modelColor 
     * @param {*} drawFunction a function with the signature (r, g, b, polyVertices)
     * @private
     */
    drawFace(face, lightColor, lightDirection, modelColor, drawFunction) {
        const center = this.renderObject.renderData.objectCenter;
        const polyVertices = [];

        for (let i = 0; i < face.indices.length; i++) {
            const vertexIdx = face.indices[i];
            const faceVertex = this.renderObject.renderData.vertices[vertexIdx];
            const worldVertex = this.toWorld(faceVertex, center, this.renderObject.translation, this.renderObject.rotation);
            const screenVertex = MathX.multiplyVxM(worldVertex, this.projection);

            if (screenVertex.x >= -1 && screenVertex.x <= 1 && screenVertex.y >= -1 && screenVertex.y <= 1) {
                polyVertices.push(screenVertex);
            } else {
                return;
            }
        }

        const lightDot = lightDirection.dot(face.worldNormal);
                
        const r = Math.max(Math.min(255, modelColor.r + lightDot * lightColor.r), 0);
        const g = Math.max(Math.min(255, modelColor.g + lightDot * lightColor.g), 0);
        const b = Math.max(Math.min(255, modelColor.b + lightDot * lightColor.b), 0);    

        drawFunction(r, g, b, polyVertices);
    }

    /**
     * Returs a normal in world space iff the normal is facing the camera at the origin
     * @private
     * @param {Face} face 
     * @param {RenderObject} renderObject
     * 
     */
    getWorldNormalIfFacing(face, renderObject) {
        const rotation = renderObject.rotation;
        const center = renderObject.renderData.objectCenter;
        const translation = renderObject.translation;

        const faceNormal = MathX.rotate(face.normal, rotation);
        const lookDirection = this.toWorld(face.centroid, center, translation, rotation).normalized();
        const dot = faceNormal.dot(lookDirection); 

        return (dot < 0) ? faceNormal : null;
    }

    /**
     * Turns a vertex in object space into a vertex in world space 
     * @private
     * @param {Vector3} vertex 
     * @param {Vector3} center 
     * @param {Vector3} translation 
     * @param {Quaternion} rotation 
     * @returns {Vector3}
     */
    toWorld(vertex, center, translation, rotation) {
        // rotate the vertex relative to the local center (ie center of the render object)      
        return MathX.rotate(vertex.subVector(center), rotation)
                    .addVector(center)
                    .addVector(translation);
    }
}
