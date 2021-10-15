Todo 
=========

v1.0
- Project points from monkey / teapot to image/canvas
    - [done] include requires, -> modules
    - [in-progress] port vector3
    - [done] draw point to canvas
	- [done] create view port / canvas
	- [done] create view matrix
	- [done]plot points using a view matrix	
	- document / add to git

v2.0
	- draw incrementally
	- draw vertices as part of the draw face (so we can ignore 'backfacing vertices')
	- ignore backfacing faces
	- allow model rotation
	- add version selection from index.html

v3.0
	- clip points against view frustrum
		- extract view frustrum from view matrix
	- allow model translation 
	- allow model scaling

v4.0
	- sort faces by distance from camera
	- draw faces (polygons)
	- add basic directional light model

v5.0
	- add z buffer
	- add rasterization

v6.0 
	- self shadowing
	- point lights ?

v7.0 
	- textures ?
	