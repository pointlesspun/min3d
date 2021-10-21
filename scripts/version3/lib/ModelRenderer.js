import { Face } from "./Face.js";
import { Quaternion } from "./Quaternion.js";
import { RenderObject } from "./RenderObject.js";
import { Vector3 } from "./Vector3.js";
import { MathX } from "./MathX.js";
import { Color } from "./Color.js";


export class ModelRenderer {

    /** 
     * @type {RenderObject}
     */
    renderObject = null;
    projection = null;
    visibleFaces = null;
    lightDirection = new Vector3(1, 1, 0).normalized();
    lightColor = new Color(62, 42, 22);
    ambientLight = new Color(120, 150, 200);

    initialize(renderObj, projection, ambientLight, lightDirection, lightColor) {
        this.renderObject = renderObj;
        this.projection = projection;
        
        this.ambientLight.copy(ambientLight);
        this.lightDirection.copy(lightDirection);
        this.lightColor.copy(lightColor);
        this.faceIdx = -1;

        return this;
    }

    filterVisibleFaces() {       
        this.visibleFaces = this.renderObject.renderData.faces.filter(f => {
            f.worldNormal = this.getWorldNormalIfFacing(f, this.renderObject);
            return f.worldNormal !== null;
        });
        return this;
    }

    sortVisibleFaces() {
        const center = this.renderObject.renderData.objectCenter;

        this.visibleFaces.forEach(f => {
            var c2 = this.toWorld(f.centroid, center, this.renderObject.translation, this.renderObject.rotation);
            f.distanceToCamera = c2.lengthSquared();
        });

        this.visibleFaces.sort((f1, f2) => f2.distanceToCamera - f1.distanceToCamera);

        return this;
    }

    draw(drawFunction) {
        this.drawVisibleFaces(0, this.lightColor, this.lightDirection, this.ambientLight, drawFunction);
    }

    drawIteratively(drawFunction, maxTime) {

        if (this.faceIdx < 0) {
            this.faceIdx = 0;
        }

        const maxFaces = this.visibleFaces.length;
        var startTime = Date.now();

        while (this.faceIdx < maxFaces && (Date.now() - startTime) < maxTime) {
            this.faceIdx = this.drawVisibleFaces(this.faceIdx, this.lightColor, this.lightDirection, this.ambientLight, drawFunction, 100);
        }

        return this.faceIdx >= maxFaces;
    }

    drawVisibleFaces(startIdx, lightColor, lightDirection, ambientLight, drawFunction, maxDrawCalls) {
        let idx = startIdx;
        let count = 0;

        while(idx < this.visibleFaces.length) {
            this.drawVisibleFace(idx, lightColor, lightDirection, ambientLight, drawFunction);
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
     * 
     * @param {*} idx 
     * @param {*} lightColor 
     * @param {*} ambientLight 
     * @param {*} drawFunction 
     * @private
     */
    drawVisibleFace(idx, lightColor, lightDirection, ambientLight, drawFunction) {
        const face = this.visibleFaces[idx];
        const center = this.renderObject.renderData.objectCenter;
        const polyVertices = [];

        for (let i = 0; i < face.indices.length; i++) {
            const vertexIdx = face.indices[i];
            const faceVertex = this.renderObject.renderData.vertices[vertexIdx];
            const screenVertex = this.toScreen(this.projection, faceVertex, center, this.renderObject.translation, this.renderObject.rotation);

            if (screenVertex.x >= -1 && screenVertex.x <= 1 && screenVertex.y >= -1 && screenVertex.y <= 1) {
                polyVertices.push(screenVertex);
            } else {
                return;
            }
        }

        const lightDot = lightDirection.dot(face.worldNormal);
                
        const r = Math.max(Math.min(255, ambientLight.r + lightDot * lightColor.r), 0);
        const g = Math.max(Math.min(255, ambientLight.g + lightDot * lightColor.g), 0);
        const b = Math.max(Math.min(255, ambientLight.b + lightDot * lightColor.b), 0);    

        drawFunction(r, g, b, polyVertices);
    }

    /**
     * 
     * @param {Face} face 
     * @param {RenderObject} renderObject
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

    toWorld(vertex, center, translation, rotation) {
        // rotate the vertex relative to the local center (ie center of the render object)      
        return MathX.rotate(vertex.subVector(center), rotation)
                    .addVector(center)
                    .addVector(translation);
    }

    toScreen( projection, vertex, center, translation, rotation) {
        return MathX.multiplyVxM(this.toWorld(vertex, center, translation, rotation), projection);
    }
}

