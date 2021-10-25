import { Matrix44 } from "./Matrix44.js";
import { Vector3 } from "./Vector3.js";
import { MathX } from "./MathX.js";
import { WaveFrontObject } from "./WaveFrontObject.js";
import { RenderObject } from "./RenderObject.js";
import { Quaternion } from "./Quaternion.js";
import { ModelRenderer } from "./ModelRenderer.js";

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
        this.fillColor = [0, 0, 200];
        this.strokeColor = [100, 100, 255];
        this.setFillColor(this.fillColor[0], this.fillColor[1], this.fillColor[2]);
        this.setStrokeColor(this.strokeColor[0], this.strokeColor[1], this.strokeColor[2]);
        this.modelRenderContext = null;
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
        this.setFillColor(r,g,b);
        this.setStrokeColor(r,g,b);
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
        this.strokeColor[0] = r;
        this.strokeColor[1] = g;
        this.strokeColor[2] = b;
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
        this.fillColor[0] = r;
        this.fillColor[1] = g;
        this.fillColor[2] = b;
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

    drawTriangle(v1, v2, v3) {
        var ctx = this.context;
     
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(v3.x, v3.y);
        ctx.closePath();
        ctx.fill();
        // if we don't stroke the drawing will have edges :-\
        ctx.stroke();
    }

    drawQuad(v1, v2, v3, v4) {
        var ctx = this.context;
     
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(v3.x, v3.y);
        ctx.lineTo(v4.x, v4.y);
        ctx.closePath();
        ctx.fill();
        // if we don't stroke the drawing will have edges :-\
        ctx.stroke();
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
     * Draws polygon 
     * @param {Vector3[]} vertices representing screen coordinates
     * @param {number} width of the viewport
     * @param {number} height of the viewport
     */
    drawSolidPolygon(vertices, width, height) {

        var screenVertices = vertices.map( v => 
             new Vector3(Math.min(width - 1, ((v.x + 1) * 0.5 * width)), Math.min(height - 1, ((1 - (v.y + 1) * 0.5) * height)),0));

        if (screenVertices.length == 3) {   
            this.drawTriangle(screenVertices[0], screenVertices[1], screenVertices[2]);
        } else {
            this.drawQuad(screenVertices[0], screenVertices[1], screenVertices[2], screenVertices[3]);
        }
    }
}