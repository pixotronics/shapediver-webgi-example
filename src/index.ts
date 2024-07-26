import {ParameterUI} from "./ParameterUI";
import {SessionManager} from "./SessionManager";
import {ShapeDiverUpdateHandler} from "./shapeDiverUpdateHandler";
import {
  CoreViewerApp,
  DepthOfFieldPlugin,
  getUrlQueryParam,
  LoadingScreenPlugin,
  mobileAndTabletCheck,
  ProgressivePlugin
} from "webgi";
import {processModel} from './processModel'
import {setupDebugUi} from './setupDebugUi'

const init = async () => {
  const ticket = getUrlQueryParam('t') || 'ee1622c04230a13e8632917d16834f2932ed3373e35a461e0a799b877d8e816f1db6168261d152536868ec651bc641e4eb5bd189520c7e9e6204e73f9b027173f09e8fdd87234380bdacb3240bb71ac8217e0e4c5924bb1dc6e75fcf5d0c76df47502202094bb4-5a7f2add154eb6589385a5718804ce39'
  const modelViewUrl = getUrlQueryParam('u') || "https://sdr8euc1.eu-central-1.shapediver.com";
  const sessionManager = new SessionManager(ticket, modelViewUrl);

  const viewer = new CoreViewerApp(
      {canvas: document.getElementById("mcanvas") as HTMLCanvasElement},
  )
  await viewer.initialize({})
  viewer.getPlugin(LoadingScreenPlugin)!.showFileNames = false;
  viewer.scene.modelRoot.modelObject.scale.set(0.1, 0.1, 0.1);

  // const sceneLoad = viewer.load(sampleScene) // no await
  const sceneLoad = viewer.load("https://playground.ijewel3d.com/assets/scenesettings/ss-001.vjson") // no await

  const updateHandler = await viewer.addPlugin(new ShapeDiverUpdateHandler())

  const isMobile = mobileAndTabletCheck()
  viewer.renderer.renderScale = Math.min(isMobile ? 1.5: 2, window.devicePixelRatio)

  // await viewer.load(sampleScene)

  // viewer.getPlugin(GroundPlugin)!.visible = !isMobile;
  viewer.getPlugin(ProgressivePlugin)!.maxFrameCount = 64;
  viewer.getPlugin(DepthOfFieldPlugin)!.enabled = false;

  // viewer.scene.setBackgroundColor('#b6cadf')

  updateHandler.processModel = processModel
  sessionManager.outputUpdateHandler = updateHandler.outputUpdateHandler;

  // Create a session with the model and load default outputs.
  await sceneLoad;
  await sessionManager.init();

  // Create a minimal user interface
  const paramsUi = new ParameterUI(
      sessionManager.parameters!,
      <HTMLDivElement>document.getElementById("parameters"),
      sessionManager.customizeSession.bind(sessionManager)
  );
  await setupDebugUi(viewer, isMobile, paramsUi)

}

init();
