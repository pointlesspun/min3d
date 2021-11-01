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
- [done] add switch for draw incrementally / immediate
- [done] add version selection from index.html
- [done] document / fix links and so on

v3.0
- [done] sort faces by distance from camera
- [done] draw faces (polygons)
- [done] add basic directional light model
- [done] weird bug with faces being culled at some angles coming from one direction but not from another...
	- [done] make camera position actual be applied correctly in toWorld
	- [done] add center as editable property
	- [done] try to reproduce the bug - turned out to be a "feature" of the data -- some quads were bend which meant they had two normals... that doesn't play nice when the code expects one normal. "Fixed" this by replacing quads with tris in Blender.
- [done] document

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
	