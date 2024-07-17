import {ParameterUI} from "./ParameterUI";
import {SessionManager} from "./SessionManager";
import {ShapeDiverUpdateHandler} from "./shapeDiverUpdateHandler";
import {
  CoreViewerApp,
  DepthOfFieldPlugin,
  getUrlQueryParam, GroundPlugin,
  LoadingScreenPlugin,
  mobileAndTabletCheck,
  ProgressivePlugin
} from "webgi";
import {processModel} from './processModel'
// @ts-ignore
import sampleScene from '/sample_scene.vjson?url'
import {setupDebugUi} from './setupDebugUi'

const init = async () => {
  const ticket = getUrlQueryParam('t') || '05ad12e1f9c943adc306ea8c081989b0e9ba943da6776c7e8925479a6cc7e20f5a3bca32c94c0b28c0be3998b0fc28dff7418a566f0f7c49694e129e7ad570e29b5a46a61bafd848c2d59da55712a1449c583971851bc5c981e65239cc7d7343fd05e3398cf2c8-2bb884c60f43f1b75274bbb7e8229218'
  const modelViewUrl = getUrlQueryParam('u') || "https://sdr8euc1.eu-central-1.shapediver.com";
  const sessionManager = new SessionManager(ticket, modelViewUrl);

  const viewer = new CoreViewerApp(
      {canvas: document.getElementById("mcanvas") as HTMLCanvasElement},
  )
  await viewer.initialize({})
  viewer.getPlugin(LoadingScreenPlugin)!.showFileNames = false;
  viewer.scene.modelRoot.modelObject.scale.set(0.1, 0.1, 0.1);

  const sceneLoad = viewer.load(sampleScene) // no await

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
      sessionManager.defaultState?.parameters!,
      <HTMLDivElement>document.getElementById("parameters"),
      sessionManager.customizeSession.bind(sessionManager)
  );
  await setupDebugUi(viewer, isMobile, paramsUi)

}

init();
