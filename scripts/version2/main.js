import { CanvasRendering } from "./lib/CanvasRendering.js";
import { Vector3 } from "./lib/Vector3.js";
import { Matrix44 } from "./lib/Matrix44.js";
import { WaveFrontObject } from "./lib/WaveFrontObject.js";
import { RenderObject } from "./lib/RenderObject.js";
import { startFetch } from "./lib/Fetch.js";
import { Appstate } from "./lib/AppState.js";
import { updateUI, bindNumberProperty, bindCheckBox } from "./lib/ui-util.js";

/**
 * Pointer to the canvas element wrapper
 */
const appRendering = new CanvasRendering("canvas").clear();

const state = new Appstate();

/**
 * Project the given render object to the given rendering
 * 
 * @param {RenderObject} model 
 * @param {CanvasRendering} rendering
 */
function project(model, rendering) {
    const projection = new Matrix44().projectionFoV(state.projectionAngle, state.projectionAspect, 0.2, 1000, false);

    var index = 0;
    
    if (state.drawUpdateHandle) {
        clearInterval(state.drawUpdateHandle);
        state.drawUpdateHandle = null;
    }

    if (state.drawIterationTime) {
        var intervalFunction = function() {
            rendering.setStrokeColor(30, 75, 205);
            rendering.setFillColor(200, 200, 245);
        
            // draw the model's lines       
            index = rendering.drawWireFrame(model, projection, index, state.drawIterationTime, state.cullBackfacing);

            if (index >= model.renderData.faces.length) {
                clearInterval(state.drawUpdateHandle);
                state.drawUpdateHandle = null;
            }
        };

        state.drawUpdateHandle = setInterval(intervalFunction, state.drawIterationTime + 10);
    } else {
        rendering.setStrokeColor(30, 75, 205);
        rendering.setFillColor(200, 200, 245);
        rendering.drawWireFrame(model, projection, index, state.drawIterationTime, state.cullBackfacing);
    }
}

function drawSelectedModel() {
    if (state.currentModel) {
        appRendering.clear();
        project(state.currentModel, appRendering);
        appRendering.setColor(180, 230, 250);
        appRendering.drawText(30, appRendering.canvas.height - 50, state.currentModel.description);
    }
}

function calculateOffset(objectInfo) {
    const span = objectInfo.span();
    return new Vector3(0, -(objectInfo.bounds.min.y + span.y / 2.0), -(span.z + span.y/2.5));
}

/**
 * Load a wavefront object (if it hasn't loaded yet).
 */
function fetchObject(objectName) {
    state.setSelectedModel(objectName);

    if (state.currentModel) {        
        updateUI();
        drawSelectedModel();
    } else {
            // keep the user up to date of the loading process
            const progressUpdate = function(percentage) {
                appRendering.clear();
                appRendering.setColor(120,140,160);
                if (percentage < 1) {
                    appRendering.drawText(30, 30, `loading: ${objectName}... ${Math.round(percentage*100)}%`);
                    appRendering.drawRect(30, 50,  percentage * (appRendering.canvas.width - 60), 2);
                } else {
                    appRendering.drawText(30, 30, `parsing: ${objectName}`);
                }
            };

            const modelFileDescription =  objectName.split(':');

            startFetch("../../data/" + modelFileDescription[0], progressUpdate, (text) => {
                appRendering.clear();

                const waveFrontObject = new WaveFrontObject().parse(text);

                state.setSelectedModel(objectName, new RenderObject(waveFrontObject,  calculateOffset(waveFrontObject)), modelFileDescription[1].trim());

                updateUI();               
                drawSelectedModel();
            });
    }
}

// Hook up the combo list event listener
const modelSelection = document.getElementById("model-selection"); 
modelSelection.addEventListener("change", () => fetchObject(modelSelection.value)); 

bindCheckBox(state, "cullBackFaces", "cullBackfacing", () => drawSelectedModel());

bindNumberProperty(state, "projection-angle", "projectionAngle", () => drawSelectedModel());
bindNumberProperty(state, "aspect-angle", "projectionAspect", () => drawSelectedModel());
bindNumberProperty(state, "draw-time", "drawIterationTime", () => drawSelectedModel());

bindNumberProperty(state, "offset-x", "currentModel.translation.x", () => drawSelectedModel());
bindNumberProperty(state, "offset-y", "currentModel.translation.y", () => drawSelectedModel());
bindNumberProperty(state, "offset-z", "currentModel.translation.z", () => drawSelectedModel());

bindNumberProperty(state, "rotation-x", "currentModel.euler.x", () => {state.updateRotation();drawSelectedModel()});
bindNumberProperty(state, "rotation-y", "currentModel.euler.y", () => {state.updateRotation();drawSelectedModel()});
bindNumberProperty(state, "rotation-z", "currentModel.euler.z", () => {state.updateRotation();drawSelectedModel()});

// load the default object
fetchObject(modelSelection.value);