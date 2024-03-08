import { ParameterUI } from "./ParameterUI";
import { SessionManager } from "./SessionManager";
import { OutputUpdateHandler } from "./OutputUpdateHandler";
import {initializeViewer} from "./viewer";
import {
  BloomPlugin, DiamondPlugin, getUrlQueryParam,
  GroundPlugin, PickingPlugin,
  ProgressivePlugin,
  SimpleBackgroundEnvUiPlugin,
  SSAOPlugin,
  SSRPlugin, TemporalAAPlugin,
  TonemapPlugin,
  TweakpaneUiPlugin
} from "webgi";

/**
 * Ticket for embedding and model view url from shapediver.com/app
 *
 * Related help pages:
 *   * https://help.shapediver.com/doc/Enable-embedding.1881571334.html
 *   * https://help.shapediver.com/doc/Geometry-Backend.1863942173.html
 */
const ticket = getUrlQueryParam('t') || '06578a6051806f23eb0c086cd688c7372adb7bffee91241b618f90371f132d01acfb2bb7b47ada678ec097f1bc2b895d567dc3dcc86fecf13ead84dee612bd4f320d515efeec64d5e31e597526a8012fa9970ba70ca616ecf25846f903218b180358215d310287-b2b6d710e669275ddc17a9d690071a4e'
const modelViewUrl = "https://sdeuc1.eu-central-1.shapediver.com";

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

  const picking = await viewer.addPlugin(new PickingPlugin());
  const uiPlugin = await viewer.addPlugin(new TweakpaneUiPlugin());

  uiPlugin.setupPluginUi(SimpleBackgroundEnvUiPlugin)
  uiPlugin.appendUiObject(viewer.scene.activeCamera)
  uiPlugin.appendUiObject(paramsUi);
  // uiPlugin.setupPluginUi(PickingPlugin)
  uiPlugin.setupPluginUi(TonemapPlugin)
  uiPlugin.setupPluginUi(GroundPlugin)
  uiPlugin.setupPluginUi(SSRPlugin)
  uiPlugin.setupPluginUi(SSAOPlugin)
  uiPlugin.setupPluginUi(DiamondPlugin)
  uiPlugin.setupPluginUi(ProgressivePlugin)
  uiPlugin.setupPluginUi(BloomPlugin)
  uiPlugin.setupPluginUi(TemporalAAPlugin)
  uiPlugin.setupPluginUi(PickingPlugin)

})();
