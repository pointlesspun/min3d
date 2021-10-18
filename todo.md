Todo 
=========

v1.0
- Project points from monkey / teapot to image/canvas
    - [done] include requires, -> modules
    - [done] draw point to canvas
	- [done] create view port / canvas
	- [done] create view matrix
	- [done] plot points using a view matrix	
	- [done] document / add to git

v2.0
- [in-progress] port vector3

- [done] draw incrementally
- [done] draw vertices as part of the draw face (so we can ignore 'backfacing vertices')
- [done] ignore backfacing faces
- [done] allow model rotation
	- [done] add quaternion
- [done] fetch loading progress
- add switch for draw incrementally / immediate
- [done] add version selection from index.html
- document

v3.0
	- sort faces by distance from camera
	- draw faces (polygons)
	- add basic directional light model

v4.0
- clip points against view frustrum
    - extract view frustrum from view matrix
	- add z buffer
	- add rasterization

v5.0 
	- self shadowing
	- point lights ?

v6.0 
	- textures ?
	