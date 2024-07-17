import {
    AssetExporterPlugin,
    BloomPlugin,
    CoreViewerApp,
    DepthOfFieldPlugin,
    DiamondPlugin,
    FileTransferPlugin,
    GroundPlugin,
    HierarchyUiPlugin,
    OutlinePlugin,
    PickingPlugin,
    RandomizedDirectionalLightPlugin,
    SimpleBackgroundEnvUiPlugin,
    SSAOPlugin,
    SSRPlugin,
    TonemapPlugin,
    TweakpaneUiPlugin
} from 'webgi'
import {ParameterUI} from './ParameterUI'

export async function setupDebugUi(viewer: CoreViewerApp, isMobile: boolean, paramsUi: ParameterUI) {
    // await viewer.addPlugin(new PickingPlugin(BoxSelectionWidget, false, true));
    await viewer.addPlugin(SimpleBackgroundEnvUiPlugin)
    await viewer.addPlugin(FileTransferPlugin)
    await viewer.addPlugin(AssetExporterPlugin)
    await viewer.addPlugin(HierarchyUiPlugin)

    const picking = await viewer.addPlugin(new PickingPlugin());
    await viewer.addPlugin(OutlinePlugin)
    viewer.renderer.refreshPipeline()

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
}
