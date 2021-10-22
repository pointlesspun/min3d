import { CanvasRendering } from "./lib/CanvasRendering.js";
import { Vector3 } from "./lib/Vector3.js";
import { Matrix44 } from "./lib/Matrix44.js";
import { WaveFrontObject } from "./lib/WaveFrontObject.js";
import { RenderObject } from "./lib/RenderObject.js";
import { startFetch } from "./lib/Fetch.js";
import { Appstate } from "./lib/AppState.js";
import * as uiUtil from "./lib/ui-util.js";
import { ModelRenderer } from "./lib/ModelRenderer.js";
import { Quaternion } from "./lib/Quaternion.js";

/**
 * Pointer to the canvas element wrapper
 * @type {CanvasRendering}
 */
const appRendering = new CanvasRendering("canvas").clear();

/**
 * Code that deals with rendering the models
 */
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

    // anything selected ?
    if (model) {
        // create the world to screen projection
        const projection = new Matrix44().projectionFoV(state.projectionAngle, state.projectionAspect, 0.2, 1000, false);
        const screenWidth = appRendering.canvas.width;
        const screenHeight = appRendering.canvas.height;

        appRendering.clear(state.backgroundColor.r, state.backgroundColor.g, state.backgroundColor.b);

        // clear the existing handle if there was one
        if (state.drawUpdateHandle) {
            clearInterval(state.drawUpdateHandle);
            state.drawUpdateHandle = null;
        }

        // define a function that puts the data actually on screen
        const drawFunction = (r,g,b,vertices) => {
            if (state.drawFaces) {
                appRendering.setColor(r,g,b);
                appRendering.drawSolidPolygon(vertices, screenWidth, screenHeight);
            }

            if (state.drawEdges) {
                appRendering.setColor(state.edgeColor.r, state.edgeColor.g, state.edgeColor.b);
                appRendering.drawWireFramePolygon(vertices, screenWidth, screenHeight );
            }
        };
        
        // prepare the model renderer
        modelRenderer.initialize(model, projection, state.lightColor, state.lightDirection, state.modelColor)
            .filterVisibleFaces()
            .sortVisibleFaces();

        // draw in iterations ?
        if (state.drawIterationTime) {
            // setup an interval 
            var intervalFunction = function() {
                if (modelRenderer.drawIteratively(drawFunction, state.drawIterationTime)) {
                    clearTimeout(state.drawUpdateHandle);
                    state.drawUpdateHandle = null;
                    // draw the description
                    appRendering.setColor(180, 230, 250);
                    appRendering.drawText(30, screenHeight - 50, model.description);
                } else {
                    state.drawUpdateHandle = setTimeout(intervalFunction, state.drawIterationTime);
                }
            };

            if (!modelRenderer.drawIteratively(drawFunction, state.drawIterationTime)) {
                state.drawUpdateHandle = setTimeout(intervalFunction, state.drawIterationTime);
            }
            
        } else {
            // draw the model in one go
            modelRenderer.draw(drawFunction);
             // draw the description
            appRendering.setColor(180, 230, 250);
            appRendering.drawText(30, screenHeight - 50, model.description);
        }      
    }
}

/**
 * Load a wavefront object (if it hasn't loaded yet).
 */
function fetchObject(objectName) {
    state.setSelectedModel(objectName);

    if (state.selectedRenderObject) {        
        uiUtil.updateUI();
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
                
                // position the camera in a best guess fashion
                const span = waveFrontObject.boundsSpan();
                const offset = new Vector3(0, -(waveFrontObject.bounds.min.y + span.y / 2.0), -(span.z + span.y/2.5));

                state.setSelectedModel(objectName, new RenderObject(waveFrontObject, offset), modelFileDescription[1].trim());

                uiUtil.updateUI();               
                drawModel();
            });
    }
}

// Hook up the combo list event listener
uiUtil.beginPropertyBinding(state, () => drawModel());
    uiUtil.bindNumberProperty({property: "projectionAngle"});
    uiUtil.bindNumberProperty({property: "projectionAspect"});
    uiUtil.bindNumberProperty({property: "drawIterationTime"});

    uiUtil.bindBooleanProperty({property: "drawFaces"});
    uiUtil.bindBooleanProperty({property:"drawEdges"});

    uiUtil.bindColorProperty({property: "edgeColor"});

    uiUtil.bindVectorProperty({property: "selectedRenderObject.translation", inputName: "offset"});
    uiUtil.bindVectorProperty({property: "selectedRenderObject.euler", inputName: "rotation", onSet: () => state.updateRotation()});
    uiUtil.bindVectorProperty({property: "selectedRenderObject.renderData.objectCenter", inputName: "center"});
    uiUtil.bindVectorProperty({property: "lightDirection"});

    uiUtil.bindColorProperty({property: "lightColor"});
    uiUtil.bindColorProperty({property: "modelColor"});
    uiUtil.bindColorProperty({property: "backgroundColor"});
uiUtil.endPropertyBinding();

// load the default selected object
const modelSelection = document.getElementById("model-selection");
modelSelection.addEventListener("change", () => fetchObject(modelSelection.value)); 
fetchObject(modelSelection.value);