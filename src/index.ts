import { ParameterUI } from "./ParameterUI";
import { SessionManager } from "./SessionManager";
import { OutputUpdateHandler } from "./OutputUpdateHandler";
import {initializeViewer} from "./viewer";
import {
  BloomPlugin, BoxSelectionWidget, DiamondPlugin,
  GroundPlugin, PickingPlugin,
  ProgressivePlugin,
  setupBackgroundUi, setupImportedLightsUi,
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
const ticket =
  "d9cd75b90722adaa07bc36be17c4b79df0432717e711f9986f5fc6770d2ce89002531f39c180947c7f561d794e04dc3e345d0046b273759caf40ae5b113778236dd6d5c1170e95912556a1486985c4d53f0402a3432e0cf84f5b3139a0f640cbbb490b243332f0-6e2fe2c513efb54f7081039330441893";
// "6058c1f795981f170476a4192113878dae12f7ad26425a1125b8b134f19ca4063e5022685ffab211558f6591add8a682d76af04e5aeef08e15261f8f5f8e427433d783c0a7bff6308437c1369a4a6bd0dfcc52dd551efebbdfcf52a80fd963e4853081850ec09e-8861545134a089b07a9c68c68f43337a";
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

  await viewer.addPlugin(new PickingPlugin(BoxSelectionWidget, false, true));

  const uiPlugin = await viewer.addPlugin(new TweakpaneUiPlugin());

  setupBackgroundUi(viewer)
  uiPlugin.appendUiObject(viewer.scene.activeCamera)

  uiPlugin.appendUiObject(paramsUi);

  uiPlugin.setupPluginUi(PickingPlugin)
  uiPlugin.setupPluginUi(TonemapPlugin)
  uiPlugin.setupPluginUi(GroundPlugin)
  uiPlugin.setupPluginUi(SSRPlugin)
  uiPlugin.setupPluginUi(SSAOPlugin)
  uiPlugin.setupPluginUi(DiamondPlugin)
  uiPlugin.setupPluginUi(ProgressivePlugin)
  setupImportedLightsUi(viewer)
  uiPlugin.setupPluginUi(BloomPlugin)
  uiPlugin.setupPluginUi(TemporalAAPlugin)

})();
