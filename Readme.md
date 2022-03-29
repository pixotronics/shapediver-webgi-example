# Shapediver webgi example
Sample project for integrating the webgi viewer with shapedriver sdk.

Run `npm run start` to start bundle development build and start local server.

Run `npm run build` to build bundle production build.

3D viewer related code is in `src/viewer.ts` file.
Ui setup with the viewer is done in `src/index.ts` file.

Viewer listens to an event `modelLoad` in the document from the shapediver sdk.
When the event is triggered, the viewer will load the model.
Objects are replaced in the scene based on uid and index of asset in the content.
To remove an object load an empty object with the same uid and index.

For webgi viewer API manual and plugin docs see: https://dist.pixotronics.com/webgi/manual/index.html
