A really short overview of Version 2
====================================

This is an expansion of the minimal version 1.0. Not exactly minimal any more but still a bad idea to try. 

main.js 
-------

1. Bind ui elements
2. Fetch the data of the default WaveFront Object 
3. Create a render object from the WaveFront Object
4. Project the render object on the canvas via the CanvasRendering

Special mentions:
-----------------

* Drawing is done incrementally (if the drawtime in the ui > 0) by setting up an interval which repeatingly calls `rendering.drawWireFrame`
* Hooking up the event handlers to the ui elements is a lot of work, so some """smart functions""" do this automatically via a discount-two-way-binding defined in ui-util.
* Quats to Eulers is iffy, so Eulers are kept for ui purposes in the RenderObject
* Fetch is a special version of `fetch` allowing for progress callbacks.
* All the application's state data is kept in the AppState.   
