import { CanvasRendering } from "./lib/CanvasRendering.js";
import { Vector3 } from "./lib/Vector3.js";
import { Quaternion } from "./lib/Quaternion.js";
import { Matrix44 } from "./lib/Matrix44.js";
import { WaveFrontObject } from "./lib/WaveFrontObject.js";
import { RenderObject } from "./lib/RenderObject.js";
import { MathX } from "./lib/MathX.js";

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

const projectionAngleInput = document.getElementById("projection-angle");
const projectionAspectInput = document.getElementById("aspect-angle");

const offsetXInput = document.getElementById("offset-x");
const offsetYInput = document.getElementById("offset-y");
const offsetZInput = document.getElementById("offset-z");

const rotationXInput = document.getElementById("rotation-x");
const rotationYInput = document.getElementById("rotation-y");
const rotationZInput = document.getElementById("rotation-z");

var cullBackfacing = true;
var currentModel = new RenderObject();
var projectionAngle = 90;
var projectionAspect = 1.0;
var handle = undefined;

/**
 * Project the WaveFront object to the given rendering
 * 
 * @param {RenderObject} model 
 * @param {CanvasRendering} rendering
 */
function project(model, rendering) {
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

        index = rendering.drawWireFrame(model, projection, index, 90, cullBackfacing);

        if (index >= model.renderData.faces.length) {
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
    const span = objectInfo.span();
    return new Vector3(0, -(objectInfo.bounds.min.y + span.y / 2.0), -(span.z + span.y/2.5));
}

function updateRotationView(euler) {
    rotationXInput.value = euler.x;
    rotationYInput.value = euler.y;
    rotationZInput.value = euler.z;
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
        updateOffsetView(currentModel.translation);
        updateRotationView(currentModel.euler);                  

        project(currentModel, appRendering);
    } else {
        fetch(objectName)
            .then(response => response.text())
            .then(text => {
                
                const waveFrontObject = new WaveFrontObject().parse(text);

                currentModel = new RenderObject(waveFrontObject,  calculateOffset(waveFrontObject));

                objectMap[objectName] = currentModel;
             
                updateOffsetView(currentModel.translation);      
                updateRotationView(currentModel.euler);          

                project(currentModel, appRendering);                
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
                project(currentModel, appRendering);
            }
        } else {
            inputField.value = getValue();
        }
        
    } catch (error) {
        inputField.value = getValue();
        console.log(`error while updating number: ${error}`);
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
        project(currentModel, appRendering);
    }
});

projectionAngleInput.addEventListener("change", () => updateNumberField(projectionAngleInput, (v) => { projectionAngle = v }, () => projectionAngle));    
projectionAspectInput.addEventListener("change", () => updateNumberField(projectionAspectInput, (v) => { projectionAspect = v }, () => projectionAspect));    

offsetXInput.addEventListener("change", () =>  updateNumberField(offsetXInput, (v) => { currentModel.translation.x = v }, () => currentModel.translation.x));
offsetYInput.addEventListener("change", () => updateNumberField(offsetYInput, (v) => { currentModel.translation.y = v }, () => currentModel.translation.y));
offsetZInput.addEventListener("change", () => updateNumberField(offsetZInput, (v) => { currentModel.translation.z = v }, () => currentModel.translation.z));    


const updateX = (v) => {
    currentModel.euler.x = v; 
    currentModel.rotation = Quaternion.fromEuler(currentModel.euler).normalized();
};

const updateY = (v) => {
    currentModel.euler.y = v; 
    currentModel.rotation = Quaternion.fromEuler(currentModel.euler).normalized();
}

const updateZ = (v) => {
    currentModel.euler.z = v; 
    currentModel.rotation = Quaternion.fromEuler(currentModel.euler).normalized();
}

rotationXInput.addEventListener("change", () =>  updateNumberField(rotationXInput, (v) => updateX(v), () => currentModel.euler.x));
rotationYInput.addEventListener("change", () => updateNumberField(rotationYInput, (v) => updateY(v), () => currentModel.euler.y));
rotationZInput.addEventListener("change", () => updateNumberField(rotationZInput, (v) => updateZ(v), () => currentModel.euler.z));    

projectionAngleInput.value = projectionAngle;
projectionAspectInput.value = projectionAspect;

rotationXInput.value = 0;
rotationYInput.value = 0;
rotationZInput.value = 0;

// load the default object
fetchObject(modelSelection[modelSelection.selectedIndex].value);