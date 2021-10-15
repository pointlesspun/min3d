import { CanvasRendering } from "./lib/CanvasRendering.js";
import { Vector3 } from "./lib/Vector3.js";
import { Matrix44 } from "./lib/Matrix44.js";
import { WaveFrontObject } from "./lib/WaveFrontObject.js";

/**
 * A place to store loaded WaveFront objects
 */
const objectMap = {};

/**
 * Pointer to the canvas element wrapper
 */
const appRendering = new CanvasRendering("canvas").clear();

/**
 * Pointer to the drop down menu with all available models.
 */
const modelSelection = document.getElementById("model-selection"); 

/**
 * Project the WaveFront object to the given rendering
 * 
 * @param {WaveFrontObject} objectInfo 
 * @param {CanvasRendering} rendering
 */
function project(objectInfo, rendering) {
    const projection = new Matrix44().projection(90, 0.2, 1000);
    const span = objectInfo.bounds.max.subVector(objectInfo.bounds.min);
    const offset = new Vector3(0, -(objectInfo.bounds.min.y + span.y / 2.0), -(span.z + span.y/2.5));

    // draw the model's lines
    rendering.setColor(30, 75, 205);
    rendering.drawObjectLines(objectInfo, projection, offset);

    // draw the model's vertices
    rendering.setColor(255, 255, 255);
    rendering.drawObjectVertices(objectInfo, projection, offset);
}


/**
 * Load a wavefront object (if it hasn't loaded yet).
 * 
 * Beetle: dikiachmadp@https://free3d.com
 * Skull: printable_models@https://free3d.com
 * Suzanne: blender3d
 * Teapot: utah teapot... (Martin Newell)
 * Male: nixor@https://free3d.com
 */
function fetchObject(objectName) {
    var obj = objectMap[objectName];

    if (obj) {
        project(obj, appRendering)
    } else {
        fetch(objectName)
            .then(response => response.text())
            .then(text => {
                obj = new WaveFrontObject().parse(text);
                objectMap[objectName] = obj;
                project(obj, appRendering);
            });
    }
}


// Hook up the combo list event listenenr
modelSelection.addEventListener("change", (evt) =>{
    appRendering.clear();
    fetchObject(evt.target[evt.target.selectedIndex].value);
}); 

// load the default object
 fetchObject(modelSelection[modelSelection.selectedIndex].value);