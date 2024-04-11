import { ParameterUI } from "./ParameterUI";
import { SessionManager } from "./SessionManager";
import { OutputUpdateHandler } from "./OutputUpdateHandler";
import {initializeViewer} from "./viewer";
import {
  AssetExporterPlugin,
  BloomPlugin, DepthOfFieldPlugin, DiamondPlugin, FileTransferPlugin, getUrlQueryParam,
  GroundPlugin, HierarchyUiPlugin, mobileAndTabletCheck, OutlinePlugin, PickingPlugin,
  ProgressivePlugin, RandomizedDirectionalLightPlugin,
  SimpleBackgroundEnvUiPlugin,
  SSAOPlugin,
  SSRPlugin, TemporalAAPlugin,
  TonemapPlugin,
  TweakpaneUiPlugin
} from "webgi";
// import sampleScene from '/sample_scene.vjson?url&asd1'

/**
 * Ticket for embedding and model view url from shapediver.com/app
 *
 * Related help pages:
 *   * https://help.shapediver.com/doc/Enable-embedding.1881571334.html
 *   * https://help.shapediver.com/doc/Geometry-Backend.1863942173.html
 */
const ticket = getUrlQueryParam('t') ||
    // '06578a6051806f23eb0c086cd688c7372adb7bffee91241b618f90371f132d01acfb2bb7b47ada678ec097f1bc2b895d567dc3dcc86fecf13ead84dee612bd4f320d515efeec64d5e31e597526a8012fa9970ba70ca616ecf25846f903218b180358215d310287-b2b6d710e669275ddc17a9d690071a4e'
    // '1ee92c54db2bdf9202211b7775f2627af5d277ca0cfc478cd1bf5e5f0112f98b5925328fb001d12972b2356f4c402737e0d213b5ca14c00038e6037a4f5736c302e468ddc1017d1b05bb7e9675d7d73176fd43a071025fca6c66644446e7a3dd726bcd0520dd53-71149e64e7d4d08fc603087102da23a8'
    // '38251464832531902ecf0ea7293b7e3fd6c3f31d5df4e974af6dd4d7ad05bbaf7ff66bba4ae0d3fed7ccbea2a58a634e17fd4ad7bb75417057f89f5b5ab76084a1360ae6627f92091242009dc1e76aa96cc0d0e1cc8f029ae33d26cc46b4263f09af39f2e75916-164d4d83120e3ce4bcdd9e08cae66fe5'
    '05ad12e1f9c943adc306ea8c081989b0e9ba943da6776c7e8925479a6cc7e20f5a3bca32c94c0b28c0be3998b0fc28dff7418a566f0f7c49694e129e7ad570e29b5a46a61bafd848c2d59da55712a1449c583971851bc5c981e65239cc7d7343fd05e3398cf2c8-2bb884c60f43f1b75274bbb7e8229218'
const modelViewUrl = "https://sdr8euc1.eu-central-1.shapediver.com";

/**
 * The SessionManager contains functionality to interpret
 * the information resulting from calls to the
 * ShapeDiver Geometry Backend API.
 */
const sessionManager = new SessionManager(ticket, modelViewUrl);

(async () => {
  /**
   * Any ShapeDiver model defines a number of so-called outputs.
   *
   * Think of these outputs like channels through which the model
   * outputs data. Every such output has identifiers which uniquely
   * identify it.
   *
   * The outputs of a ShapeDiver model are static. As you change
   * parameter values, the outputs and their identifiers stay the same.
   * What changes is the outputs' content.
   *
   * In the following we assign an output update handler
   * to the session manager. This handler will be called
   * whenever the contents of an output change in response
   * to a customization request.
   *
   * --> In case you are implementing a custom viewer:
   *
   *    Adapt OutputUpdateHandler to download
   *    resulting glTFs and put them into your scene.
   */
  sessionManager.outputUpdateHandler = OutputUpdateHandler;

  const viewer = await initializeViewer();

  // Create a session with the model and load default outputs.
  await sessionManager.init();

  // Create a minimal user interface
  const paramsUi = new ParameterUI(
    sessionManager.defaultState?.parameters!,
    <HTMLDivElement>document.getElementById("parameters"),
    sessionManager.customizeSession.bind(sessionManager)
  );

  // await viewer.addPlugin(new PickingPlugin(BoxSelectionWidget, false, true));
  await viewer.addPlugin(SimpleBackgroundEnvUiPlugin)
  await viewer.addPlugin(FileTransferPlugin)
  await viewer.addPlugin(AssetExporterPlugin)
  await viewer.addPlugin(HierarchyUiPlugin)

  const picking = await viewer.addPlugin(new PickingPlugin());
  await viewer.addPlugin(OutlinePlugin)
  viewer.renderer.refreshPipeline()

  const isMobile = mobileAndTabletCheck()
  viewer.renderer.renderScale = Math.min(isMobile ? 1.5: 2, window.devicePixelRatio)

  const uiPlugin = await viewer.addPlugin(new TweakpaneUiPlugin(!isMobile));
  uiPlugin.colorMode = 'white'

  uiPlugin.appendUiObject(paramsUi);
  uiPlugin.setupPluginUi(HierarchyUiPlugin)
  uiPlugin.setupPluginUi(SimpleBackgroundEnvUiPlugin)
  uiPlugin.appendUiObject(viewer.scene.activeCamera)
  // uiPlugin.setupPluginUi(PickingPlugin)
  uiPlugin.setupPluginUi(TonemapPlugin)
  // uiPlugin.setupPluginUi(OutlinePlugin)
  uiPlugin.setupPluginUi(GroundPlugin)
  uiPlugin.setupPluginUi(SSRPlugin)
  uiPlugin.setupPluginUi(SSAOPlugin)
  uiPlugin.setupPluginUi(DiamondPlugin)
  // uiPlugin.setupPluginUi(ProgressivePlugin)
  uiPlugin.setupPluginUi(BloomPlugin)
  // uiPlugin.setupPluginUi(TemporalAAPlugin)
  uiPlugin.setupPluginUi(PickingPlugin)
  uiPlugin.setupPluginUi(AssetExporterPlugin)
  uiPlugin.setupPluginUi(DepthOfFieldPlugin)
  uiPlugin.setupPluginUi(RandomizedDirectionalLightPlugin)

  // await viewer.load(sampleScene)

  viewer.getPlugin(ProgressivePlugin)!.maxFrameCount = 64;
  viewer.getPlugin(DepthOfFieldPlugin)!.enabled = false;
  // viewer.scene.setBackgroundColor('#b6cadf')

})();
