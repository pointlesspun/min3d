import { Appstate } from "./lib/AppState.js";
import { Color } from "./lib/Color.js";
import { Rasterization } from "./lib/Rasterization.js";
import { definedOrDefault } from "./lib/types.js";

import * as uiUtil from "./lib/ui-util.js";

/** Current user settings */
const appState = new Appstate();

/** Rasterizer to the canvas */
let rasterizer = new Rasterization("canvas", appState.resolution.x, appState.resolution.y);


/**
 * Fill a buffer with scanlines made up of colorized lines of randomlength.
 * @param {number} maxLength is the upper bounds of the length of the randomized parts 
 */
function fillCanvasWithScanlines(maxLength) {

    const w = rasterizer.bufferWidth;
    const h = rasterizer.bufferHeight;
    
    maxLength = definedOrDefault(maxLength, w);

    for (let y = 0; y < h; y++) {
        let x = 0;

        while (x < w) {
            var scanlineWidth = Math.floor(1 + (Math.random() * (maxLength-1)));
            var color = Math.random() * 255;
            rasterizer.addScanLine(x, y, scanlineWidth, 
                    new Color(color * appState.colorMultiplier.x, color * appState.colorMultiplier.y, color * appState.colorMultiplier.z, 255));
            x += scanlineWidth;
        } 
    }    

    return rasterizer;
}

/**
 * Update callback, fills the canvas, renders it to the canvas and switches the buffer
 */
function update() {

    fillCanvasWithScanlines(appState.maxScanlineWidth)
        .render()
        .switchBuffer();
    
    setTimeout(update, appState.updateInterval);
}

// Hook up the combo list event listener
uiUtil.beginPropertyBinding(appState);
    uiUtil.bindVectorProperty({property: "resolution", onSet: () => {
        rasterizer = new Rasterization("canvas", appState.resolution.x, appState.resolution.y);
    }});

    uiUtil.bindVectorProperty({property: "colorMultiplier"});
    uiUtil.bindNumberProperty({property: "maxScanlineWidth"});
    uiUtil.bindNumberProperty({property: "updateInterval"});

uiUtil.endPropertyBinding();
uiUtil.updateUI();

setTimeout(update, appState.updateInterval);