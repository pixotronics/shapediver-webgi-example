# Shapediver webgi example

Deployed at: https://shapediver.pixotronics.com/

Sample project for integrating the webgi viewer with shapedriver sdk.

Run `npm run start` to start bundle development build and start local server.

Run `npm run build` to build bundle production build.

Viewer and shapediver session setup is done in `src/index.ts` file.

Objects are replaced in the scene based on uid and index of asset in the content.
To remove an object, load an empty object with the same uid and index.

For webgi viewer API manual and plugin docs see: https://webgi.xyz.docs
