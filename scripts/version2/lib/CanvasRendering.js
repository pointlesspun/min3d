import { Matrix44 } from "./Matrix44.js";
import { Vector3 } from "./Vector3.js";
import { MathX } from "./MathX.js";
import { WaveFrontObject } from "./WaveFrontObject.js";
import { RenderObject } from "./RenderObject.js";
import { Quaternion } from "./Quaternion.js";

/**
 * Wrapper around writing to a canvas
 */
export class CanvasRendering {

    /**
     * Set ups the canvas and its context
     * @param {string} canvasId id of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.context.font = "24px Arial Helvetica sans-serif";
    }

    /**
     * Clears the canvas
     * 
     * @param {number:20} r 
     * @param {number:20} g 
     * @param {number:60} b 
     * @returns 
     */
    clear(r,g,b) {
        this.setColor(r || 20, g || 20, b || 60);
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height );
        
        return this;
    }

    /**
     * Sets the current fill and stroke colors
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     */
    setColor(r, g, b) {
        const value = `rgb(${r}, ${g}, ${b})`;
        this.context.fillStyle = value;
        this.context.strokeStyle = value;
    }

    /** 
     * Sets the color of the stroke style 
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     */
    setStrokeColor(r, g, b) {
        const value = `rgb(${r}, ${g}, ${b})`;
        this.context.strokeStyle = value;
    }

    /** 
     * Sets the color of the fill style 
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     */
    setFillColor(r, g, b) {
        const value = `rgb(${r}, ${g}, ${b})`;
        this.context.fillStyle = value;
    }

    /**
     * Draws a point at the given x/y coordinates using the fill color
     * @param {number} x
     * @param {number} y 
     */
    drawPoint(x, y) {
        if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
            this.context.fillRect(x, y, 1, 1);
        }   
    }

    /**
     * Draws a rectangle at (x,y) with size (w,h)
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    drawRect(x, y, w, h) {
        this.context.fillRect(x, y, w, h);
    }

    /**
     * Draw a line from (x1,y1) to (x2, y2) using the current stroke color
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     */
    drawLine(x1, y1, x2, y2) {
        const ctx = this.context;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    /**
     * Draws text at the given coordinates
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {string} text text to draw
     * @param {string} [font] optional font description
     */
    drawText(x, y, text, font) {
        if (font) {
            this.context.font = font;
        }
        this.context.strokeText(text, x, y);
    }

    /**
     * Test if the given face's back is facing the 'camera'. 
     * 
     * @param {RenderObject} renderObj 
     * @param {*} face 
     * @param {*} center 
     * @returns 
     */
    isFacingBackwards(renderObj, face, center) {
        const faceNormal = MathX.rotate(face.normal, renderObj.rotation);
        
        // take any vector from the face and translate it relative to the center of the render object
        const faceVertex = renderObj.renderData.vertices[face.indices[0]].subVector(center);
        
        // calculate the direction from the camera towards this vertex, taking in account the object's rotation
        // and translation
        const lookDirection = MathX.rotate(faceVertex, renderObj.rotation).addVector(center).addVector(renderObj.translation).normalized();

        return faceNormal.dot(lookDirection) >= 0;
    }

    /**
     * Draw the edges of all the faces in the given objectInfo's data
     * 
     * @param {RenderObject} renderObj 
     * @param {Matrix44} projection projection matrix used
     * @param {Vector3} offset offset added to each of the face's vertices
     */
    drawWireFrame(renderObj, projection, startIndex, maxTime, cullBackfacing) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const renderData = renderObj.renderData;
        const center = renderData.bounds.min.addVector(renderData.span().div(2));

        var index = startIndex || 0;
        var startTime = Date.now();

        while (index < renderData.faces.length) {
            
            const face = renderData.faces[index];
            
            if (!cullBackfacing || !this.isFacingBackwards(renderObj, face, center)) {
                this.drawWireFramePolygonProjection(face.indices, 
                    renderData.vertices, center, renderObj.rotation, renderObj.translation, projection, width, height);
            }

            index++;

            if (maxTime && maxTime > 0 && (Date.now() - startTime) > maxTime) {
                break;
            }
        }   

        return index;
    }

    /**
     * Draw a wireframe of the given polygon
     * @param {int[]} indices of the vertices to use that make up the polygon
     * @param {Vector3[]} vertices list of vertices
     * @param {Vector3} center of the rotation
     * @param {Quaternion} rotation the rotation
     * @param {Vector3} translation of the vertices
     * @param {Matrix44} projection used to project the vertices into view space
     * @param {number} width of the viewport
     * @param {number} height of the viewport
     */
    drawWireFramePolygonProjection(indices, vertices, center, rotation, translation, projection, width, height) {
                                
        const polyVertices = indices.map( idx => {
            // rotate the vertex relative to the local center (ie center of the render object)
            const vertex = vertices[idx].subVector(center);
            const rotatedVertex = MathX.rotate(vertex, rotation).addVector(center);
            
            return MathX.multiplyVxM(rotatedVertex.addVector(translation), projection);
        });

        // don't draw the polygon if any of its vertices are off screen. In the future, we will
        // do appropriate clipping but for now just reject the polygon
        if (!polyVertices.some((projected) => 
            projected.x < -1 || projected.x > 1 || projected.y < -1 || projected.y > 1)) { 
                
            this.drawWireFramePolygon(polyVertices, width, height);
        }
    }

    /**
     * Draws a wireframe of a polygon 
     * @param {Vector3[]} vertices representing screen coordinates
     * @param {number} width of the viewport
     * @param {number} height of the viewport
     */
    drawWireFramePolygon(vertices, width, height) {

        for (var i = 0; i < vertices.length; i++) {
            var p1 = vertices[i];
            var p2 = vertices[(i+1) % vertices.length];

            let x1 = Math.min(width - 1, ((p1.x + 1) * 0.5 * width)); 
            let y1 = Math.min(height - 1, ((1 - (p1.y + 1) * 0.5) * height)); 

            let x2 = Math.min(width - 1, ((p2.x + 1) * 0.5 * width)); 
            let y2 = Math.min(height - 1, ((1 - (p2.y + 1) * 0.5) * height)); 

            this.drawLine(x1, y1, x2, y2);

            // draw the vertex on the start of the line (don't need to draw the end vertex as
            // that will be the 'start vertex' in the next iteration)
            this.context.fillRect(x1, y1, 1, 1);
        }
    }

    /**
     * Draws all vertices in the given objectInfo's data
     * @param {WaveFrontObject} objectInfo 
     * @param {Matrix44} projection 
     * @param {Vector3} offset 
     */
    drawObjectVertices(objectInfo, projection, offset) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (let vertex of objectInfo.vertices) {
            const vector = vertex.addVector(offset);
            const projected = MathX.multiplyVxM(vector, projection);

            if (projected.x < -1 || projected.x > 1 || projected.y < -1 || projected.y > 1) continue; 
            
            let x = Math.min(width - 1, ((projected.x + 1) * 0.5 * width)); 
            let y = Math.min(height - 1, ((1 - (projected.y + 1) * 0.5) * height)); 

            this.drawPoint(x, y);
        }
    }
}