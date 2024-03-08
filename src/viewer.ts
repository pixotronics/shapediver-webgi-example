import {
    DiamondPlugin,
    IModel,
    ITexture,
    ProgressivePlugin,
    ViewerApp,
    GroundPlugin, Vector3, CoreViewerApp, LoadingScreenPlugin,
} from "webgi";

function disposeModel(model: any) {
    model.dispose();
}
function makeDiamonds(model: any, diamondPlugin: DiamondPlugin) {
    model.traverse((m: any) => {
        if (m.material && m.material.name.startsWith("diamond_")) {
            diamondPlugin.makeDiamond(m.material, { cacheKey: m.material.name }, {});
        }
    });
}

export async function initializeViewer() {
    let models: any = {};
    let iii = 0;
    document.addEventListener("modelLoad", (ev) => {
        const viewer = (window as any).viewer as ViewerApp;
        if (!viewer) return;
        console.warn('modelLoad', ev);
        viewer.load((ev as any).detail.item.href + "#file" + iii + ".glb", {autoScale: false, pseudoCenter: false})
            .then((ms) => {
                console.log(ms)
                // remove model at index ev.detail.i
                // const index = iii++;//(ev as any).detail.i;
                const index = (ev as any).detail.i;
                const uid = (ev as any).detail.output.uid;
                if (models && models[uid] && models[uid][index]) { // todo: make clearAll
                    models[uid][index].forEach((m: IModel) => disposeModel(m.modelObject));
                    models[uid][index] = [];
                }
                if(!models[uid]) models[uid] = [];
                models[uid][index] = [ms];
                models[uid][index].forEach((m: IModel) => makeDiamonds(m.modelObject, viewer.getPlugin(DiamondPlugin)!));
                viewer.setDirty();
            });
    });
    document.dispatchEvent(new CustomEvent("modelLoad", {}));
    const viewer = new CoreViewerApp(
        {canvas: document.getElementById("mcanvas") as HTMLCanvasElement},
    )
    await viewer.initialize({})
    viewer.getPlugin(LoadingScreenPlugin)!.showFileNames = false;
    ;(window as any).viewer = viewer;
    viewer.getPlugin(ProgressivePlugin)!.maxFrameCount = 200;
    viewer.scene.modelRoot.modelObject.scale.set(0.1, 0.1, 0.1);
    const ee2 = "https://demo-assets.pixotronics.com/pixo/hdr/gem_2.hdr";
    await viewer.setEnvironmentMap(ee2);
    viewer.scene.setBackgroundColor('#b6cadf')
    return viewer;
}
