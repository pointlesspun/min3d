import { Color } from "./Color.js";
import { Quaternion } from "./Quaternion.js";
import { RenderObject } from "./RenderObject.js";
import { Vector3 } from "./Vector3.js";

export class Appstate {
    /** A container to store the render objects */
    renderObjects = {};

    /** Currently visible render object  */
    selectedRenderObject = null;
    
    /** Projection angle used by the 'camera' (fov) */
    projectionAngle = 90;

    /** Aspect ration used by the 'camera' */
    projectionAspect = 1.0;

    /** Handle to the current draw interval */
    drawUpdateHandle = null;   

    /** Max time alotted to a single draw iteration, if zero or negative each iteration can take as much time as it wants. */
    drawIterationTime = 50;

    ambientLight = new Color(100, 100, 100);

    lightDirection  = new Vector3(1, 0, 0);

    lightColor = new Color(100, 100, 100);

    /**
     * Sets the selected model. If the model wasn't selected before, stores it in memory.
     * 
     * @param {string} name id / filename 
     * @param {RenderObject} model render data, may be null and the model will be retrieved from memory (if present)
     * @param {string} description description of the render data, used for presentation purposes
     * @returns 
     */
    setSelectedModel(name, model, description) {
        if (model) {
            if (this.renderObjects[name] !== model) {
                this.renderObjects[name] = model;
                model.description = description;
            }
        } else {
            model = this.renderObjects[name];
        }

        this.selectedRenderObject = model;

        return this.selectedRenderObject;
    }

    /**
     * Updates the rotation off the current Euler angles.
     */
    updateRotation() {
        this.selectedRenderObject.rotation = Quaternion.fromEuler(this.selectedRenderObject.euler).normalized();
    }
}