import { CanvasRendering } from "./lib/CanvasRendering.js";
import { Vector3 } from "./lib/Vector3.js";
import { Quaternion } from "./lib/Quaternion.js";
import { Matrix44 } from "./lib/Matrix44.js";
import { WaveFrontObject } from "./lib/WaveFrontObject.js";
import { RenderObject } from "./lib/RenderObject.js";
import { startFetch } from "./lib/Fetch.js";
import { Appstate } from "./lib/AppState.js";

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

const drawTimeInput = document.getElementById("draw-time");

const state = new Appstate();

/**
 * Project the WaveFront object to the given rendering
 * 
 * @param {RenderObject} model 
 * @param {CanvasRendering} rendering
 */
function project(model, rendering) {
    const projection = new Matrix44().projectionFoV(state.projectionAngle, state.projectionAspect, 0.2, 1000, false);

    var index = 0;
    
    if (state.handle !== undefined) {
        clearInterval(state.handle);
        state.handle = undefined;
    }
    
    rendering.setStrokeColor(30, 75, 205);
    rendering.setFillColor(200, 200, 245);

    if (state.drawIterationTime) {
        var intervalFunction = function() {
            // draw the model's lines       
            index = rendering.drawWireFrame(model, projection, index, state.drawIterationTime, state.cullBackfacing);

            if (index >= model.renderData.faces.length) {
                clearInterval(state.handle);
            }
        };

        state.handle = setInterval(intervalFunction, state.drawIterationTime + 10);
    } else {
        rendering.drawWireFrame(model, projection, index, state.drawIterationTime, state.cullBackfacing);
    }
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
 */
function fetchObject(objectName) {
    state.setSelectedModel(objectName);

    if (state.currentModel) {        
        updateOffsetView(state.currentModel.translation);
        updateRotationView(state.currentModel.euler);                  

        project(state.currentModel, appRendering);
    } else {
            const progressUpdate = function(percentage) {
                appRendering.clear();
                appRendering.setColor(120,140,160);
                if (percentage < 1) {
                    appRendering.drawText(30, 30, `loading: ${objectName}... ${Math.round(percentage*100)}%`);
                } else {
                    appRendering.drawText(30, 30, `parsing: ${objectName}`);
                }
            };

            startFetch(objectName, progressUpdate, (text) => {
                appRendering.clear();

                const waveFrontObject = new WaveFrontObject().parse(text);

                state.setSelectedModel(objectName, new RenderObject(waveFrontObject,  calculateOffset(waveFrontObject)));

                updateOffsetView(state.currentModel.translation);      
                updateRotationView(state.currentModel.euler);          

                project(state.currentModel, appRendering);                
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
                project(state.currentModel, appRendering);
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
    state.cullBackfacing = cullBackfacingCheckbox.checked;
    
    if (state.currentModel) {
        appRendering.clear();
        project(state.currentModel, appRendering);
    }
});

drawTimeInput.addEventListener("change", 
    () => updateNumberField(drawTimeInput, (v) => { state.drawIterationTime = v }, () => state.drawIterationTime));    

projectionAngleInput.addEventListener("change", 
    () => updateNumberField(projectionAngleInput, (v) => { state.projectionAngle = v }, () => state.projectionAngle));    

projectionAspectInput.addEventListener("change", 
    () => updateNumberField(projectionAspectInput, (v) => { state.projectionAspect = v }, () => state.projectionAspect));    

offsetXInput.addEventListener("change", 
    () =>  updateNumberField(offsetXInput, (v) => { state.currentModel.translation.x = v }, () => state.currentModel.translation.x));

offsetYInput.addEventListener("change", 
    () => updateNumberField(offsetYInput, (v) => { state.currentModel.translation.y = v }, () => state.currentModel.translation.y));

offsetZInput.addEventListener("change",
     () => updateNumberField(offsetZInput, (v) => { state.currentModel.translation.z = v }, () => state.currentModel.translation.z));    


const updateX = (v) => {
    state.currentModel.euler.x = v; 
    state.currentModel.rotation = Quaternion.fromEuler(state.currentModel.euler).normalized();
};

const updateY = (v) => {
    state.currentModel.euler.y = v; 
    state.currentModel.rotation = Quaternion.fromEuler(state.currentModel.euler).normalized();
}

const updateZ = (v) => {
    state.currentModel.euler.z = v; 
    state.currentModel.rotation = Quaternion.fromEuler(state.currentModel.euler).normalized();
}

rotationXInput.addEventListener("change", () =>  updateNumberField(rotationXInput, (v) => updateX(v), () => state.currentModel.euler.x));
rotationYInput.addEventListener("change", () => updateNumberField(rotationYInput, (v) => updateY(v), () => state.currentModel.euler.y));
rotationZInput.addEventListener("change", () => updateNumberField(rotationZInput, (v) => updateZ(v), () => state.currentModel.euler.z));    

projectionAngleInput.value = state.projectionAngle;
projectionAspectInput.value = state.projectionAspect;

drawTimeInput.value = state.drawIterationTime;

rotationXInput.value = 0;
rotationYInput.value = 0;
rotationZInput.value = 0;

// load the default object
fetchObject(modelSelection[modelSelection.selectedIndex].value);