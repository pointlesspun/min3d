import { CanvasRendering } from "./lib/CanvasRendering.js";
import { Vector3 } from "./lib/Vector3.js";
import { Matrix44 } from "./lib/Matrix44.js";
import { WaveFrontObject } from "./lib/WaveFrontObject.js";
import { RenderObject } from "./lib/RenderObject.js";
import { startFetch } from "./lib/Fetch.js";
import { Appstate } from "./lib/AppState.js";
import { updateUI, bindNumberProperty, bindCheckBox, uiUtilConfig } from "./lib/ui-util.js";
import { ModelRenderer } from "./lib/ModelRenderer.js";
import { Color } from "./lib/Color.js";

/**
 * Pointer to the canvas element wrapper
 */
const appRendering = new CanvasRendering("canvas").clear();

const modelRenderer = new ModelRenderer();

/**
 * Contains all application wide state related variables
 */
const state = new Appstate();

/**
 * Project the given render object to the given rendering
 * 
 * @param {RenderObject} model 
 * @param {CanvasRendering} rendering
 */
function drawModel() {
    const model = state.selectedRenderObject;

    if (model) {
        const projection = new Matrix44().projectionFoV(state.projectionAngle, state.projectionAspect, 0.2, 1000, false);
    
        appRendering.clear();

        // clear the existing handle if there was one
        if (state.drawUpdateHandle) {
            clearInterval(state.drawUpdateHandle);
            state.drawUpdateHandle = null;
        }

        const drawFunction = (r,g,b,vertices) => {
            appRendering.setColor(r,g,b);
            appRendering.drawSolidPolygon(vertices, appRendering.canvas.width, appRendering.canvas.height);
        };
        
        modelRenderer.initialize(model, projection, state.lightColor, state.lightDirection, state.ambientLight)
            .filterVisibleFaces()
            .sortVisibleFaces();

        if (state.drawIterationTime) {
            var intervalFunction = function() {
                if (modelRenderer.drawIteratively(drawFunction, state.drawIterationTime)) {
                    clearInterval(state.drawUpdateHandle);
                    state.drawUpdateHandle = null;
                }
            };

            state.drawUpdateHandle = setInterval(intervalFunction, state.drawIterationTime + 10);
        } else {
            modelRenderer.draw(drawFunction);
        }

        appRendering.setColor(180, 230, 250);
        appRendering.drawText(30, appRendering.canvas.height - 50, model.description);
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

    if (state.selectedRenderObject) {        
        updateUI();
        drawModel();
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
                drawModel();
            });
    }
}

// Hook up the combo list event listener
uiUtilConfig.defaultPostUpdateFunction = () => drawModel();

const modelSelection = document.getElementById("model-selection"); 
modelSelection.addEventListener("change", () => fetchObject(modelSelection.value)); 

bindNumberProperty(state, "projection-angle", "projectionAngle");
bindNumberProperty(state, "aspect-angle", "projectionAspect");
bindNumberProperty(state, "draw-time", "drawIterationTime");

bindNumberProperty(state, "offset-x", "selectedRenderObject.translation.x");
bindNumberProperty(state, "offset-y", "selectedRenderObject.translation.y");
bindNumberProperty(state, "offset-z", "selectedRenderObject.translation.z");

bindNumberProperty(state, "rotation-x", "selectedRenderObject.euler.x", () => state.updateRotation());
bindNumberProperty(state, "rotation-y", "selectedRenderObject.euler.y", () => state.updateRotation());
bindNumberProperty(state, "rotation-z", "selectedRenderObject.euler.z", () => state.updateRotation());

bindNumberProperty(state, "light-x", "lightDirection.x");
bindNumberProperty(state, "light-y", "lightDirection.y");
bindNumberProperty(state, "light-z", "lightDirection.z");

bindNumberProperty(state, "light-r", "lightColor.r");
bindNumberProperty(state, "light-g", "lightColor.g");
bindNumberProperty(state, "light-b", "lightColor.b");

bindNumberProperty(state, "ambient-r", "ambientLight.r");
bindNumberProperty(state, "ambient-g", "ambientLight.g");
bindNumberProperty(state, "ambient-b", "ambientLight.b");

// load the default object
fetchObject(modelSelection.value);