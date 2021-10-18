import { Quaternion } from "./Quaternion.js";

export class Appstate {
    /**
     * A place to store the render objects
     */
    objectMap = {};
    cullBackfacing = true;
    currentModel = null;
    
    projectionAngle = 90;
    projectionAspect = 1.0;
    drawUpdateHandle = null;   
    drawIterationTime = 50;

    setSelectedModel(name, model, description) {
        if (model) {
            if (this.objectMap[name] !== model) {
                this.objectMap[name] = model;
                model.description = description;
            }
        } else {
            model = this.objectMap[name];
        }

        this.currentModel = model;

        return this.currentModel;
    }

    updateRotation() {
        this.currentModel.rotation = Quaternion.fromEuler(this.currentModel.euler).normalized();
    }
}