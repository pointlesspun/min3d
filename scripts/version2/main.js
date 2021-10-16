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

const cullBackfacingCheckbox = document.getElementById("cullBackFaces");

const offsetXInput = document.getElementById("offset-x");
const offsetYInput = document.getElementById("offset-y");
const offsetZInput = document.getElementById("offset-z");

const projectionAngleInput = document.getElementById("projection-angle");
const projectionAspectInput = document.getElementById("aspect-angle");

var cullBackfacing = true;
var currentModel = null;
var offset = new Vector3(0, 0, 0);
var projectionAngle = 90;
var projectionAspect = 1.0;
var handle = undefined;

/**
 * Project the WaveFront object to the given rendering
 * 
 * @param {WaveFrontObject} objectInfo 
 * @param {CanvasRendering} rendering
 */
function project(objectInfo, objectOffset, rendering) {
    const projection = new Matrix44().projectionFoV(projectionAngle, projectionAspect, 0.2, 1000, false);

    var index = 0;
    
    if (handle !== undefined) {
        clearInterval(handle);
        handle = undefined;
    }
    
    var intervalFunction = function() {
        // draw the model's lines
        rendering.setStrokeColor(30, 75, 205);
        rendering.setFillColor(200, 200, 245);

        index = rendering.drawWireFrame(objectInfo, projection, objectOffset, index, 90, true, cullBackfacing);

        if (index >= objectInfo.faces.length) {
            clearInterval(handle);
        }
    };

    handle = setInterval(intervalFunction, 100);
}

function updateOffsetView(newOffset) {
    offsetXInput.value = newOffset.x;
    offsetYInput.value = newOffset.y;
    offsetZInput.value = newOffset.z;
}

function calculateOffset(objectInfo) {
    const span = objectInfo.bounds.max.subVector(objectInfo.bounds.min);
    return new Vector3(0, -(objectInfo.bounds.min.y + span.y / 2.0), -(span.z + span.y/2.5));

}

/**
 * Load a wavefront object (if it hasn't loaded yet).
 * 
 * Beetle: dikiachmadp@https://free3d.com
 * Cube: press save after blender opens...
 * Skull: printable_models@https://free3d.com
 * Suzanne: blender3d
 * Teapot: utah teapot... (Martin Newell)
 * Male: nixor@https://free3d.com
 */
function fetchObject(objectName) {
    currentModel = objectMap[objectName];

    if (currentModel) {
        project(currentModel.waveFrontObject, currentModel.offset, appRendering);
        updateOffsetView(currentModel.offset);
                
    } else {
        fetch(objectName)
            .then(response => response.text())
            .then(text => {

                const waveFrontObject = new WaveFrontObject().parse(text);
                offset = calculateOffset(waveFrontObject);

                currentModel = {
                    waveFrontObject,
                    offset 
                };

                objectMap[objectName] = currentModel;
             
                project(currentModel.waveFrontObject, currentModel.offset, appRendering);
                updateOffsetView(currentModel.offset);                
            });            
    }
}

function updateNumberField(inputField, setValue, getValue) {
    try {
        var newValue = parseFloat(inputField.value);
        if (!Number.isNaN(newValue))
        {
            if (newValue !== getValue()) {
                setValue(newValue);

                appRendering.clear();
                project(currentModel.waveFrontObject, currentModel.offset, appRendering);
            }
        } else {
            inputField.value = getValue();
        }
        
    } catch (error) {
        inputField.value = getValue();
    }
}

// Hook up the combo list event listenenr
modelSelection.addEventListener("change", (evt) =>{
    appRendering.clear();
    fetchObject(evt.target[evt.target.selectedIndex].value);
}); 

cullBackfacingCheckbox.addEventListener("click", () => {
    cullBackfacing = cullBackfacingCheckbox.checked;
    
    if (currentModel) {
        appRendering.clear();
        project(currentModel.waveFrontObject, currentModel.offset, appRendering);
    }
});

offsetXInput.addEventListener("change", () =>  updateNumberField(offsetXInput, (v) => { offset.x = v }, () => offset.x));
offsetYInput.addEventListener("change", () => updateNumberField(offsetYInput, (v) => { offset.y = v }, () => offset.y));
offsetZInput.addEventListener("change", () => updateNumberField(offsetZInput, (v) => { offset.z = v }, () => offset.z));    
projectionAngleInput.addEventListener("change", () => updateNumberField(projectionAngleInput, (v) => { projectionAngle = v }, () => projectionAngle));    
projectionAspectInput.addEventListener("change", () => updateNumberField(projectionAspectInput, (v) => { projectionAspect = v }, () => projectionAspect));    

projectionAngleInput.value = projectionAngle;
projectionAspectInput.value = projectionAspect;

// load the default object
 fetchObject(modelSelection[modelSelection.selectedIndex].value);