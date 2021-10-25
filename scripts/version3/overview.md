A really short overview of Version 3 (an overview surprisingly similar to version 2)
====================================================================================

This is an expansion of the minimal version 1.0. Not exactly minimal any more but still a bad idea to try. 

main.js 
-------

1. Bind ui elements
2. Fetch the data of the default WaveFront Object 
3. Create a render object from the WaveFront Object
4. Project the render object on the canvas via the CanvasRendering
    * Set up the ModelRenderer (cull non facing vertices, sort them) 
    * Draw either the entire model or draw it in iterations (for models with plenty of faces)

Special mentions:
-----------------

* Drawing is done incrementally (if the drawtime in the ui > 0) by setting up an interval which repeatingly calls `rendering.drawWireFrame`
* Hooking up the event handlers to the ui elements is a lot of work, so some """smart functions""" do this automatically via a discount-two-way-binding defined in ui-util.
* Quats to Eulers is iffy, so Eulers are kept for ui purposes in the RenderObject
* Fetch is a special version of `fetch` allowing for progress callbacks.
* All the application's state data is kept in the AppState.   
* There is a limitation with what type of faces can be drawn by this "3d engine": the vertices of a quads must lie on the same plane. However WaveFrontObjects do no guarantee this to be true: quads may be "bent". The result was that faces got rejected from drawing because a 'fold' of the quad
was not facing the camera. The solution is to fix the data, turn all quads into triangles.
* The notion of the camera position is not entirely correct, it is probably inverted. It doesn't matter for the end result but makes debugging a bit messy.