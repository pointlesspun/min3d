
export class Appstate {
    /**
     * A place to store the render objects
     */
    objectMap = {};
    cullBackfacing = true;
    currentModel = null;
    projectionAngle = 90;
    projectionAspect = 1.0;
    handle = null;   
    drawIterationTime = 50;

    setSelectedModel(name, model) {
        if (model) {
            if (this.objectMap[name] !== model) {
                this.objectMap[name] = model;
            }
        } else {
            model = this.objectMap[name];
        }

        this.currentModel = model;

        return this.currentModel;
    }
}