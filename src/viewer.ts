import {
    DiamondPlugin,
    IModel,
    ITexture,
    ProgressivePlugin,
    setupCoreWebGiViewer,
    ViewerApp
} from "webgi";

function disposeModel(model: any) {
    model.removeFromParent();
    model.traverse((m: any) => {
        if (m.material) {
            for (const key of Object.keys(m.material)) {
                if (key === "map" || key.endsWith("Map")) {
                    let v = m.material[key];
                    if (v && v.dispose) v.dispose();
                }
            }
            if (m.material.dispose) m.material.dispose();
        }
        if (m.geometry) {
            m.geometry.dispose();
        }
    });
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
        viewer.getManager()!
            .addFromPath((ev as any).detail.item.href + "#file" + iii + ".glb", {autoScale: false, pseudoCenter: false})
            .then((ms) => {
                // remove model at index ev.detail.i
                // const index = iii++;//(ev as any).detail.i;
                const index = (ev as any).detail.i;
                const uid = (ev as any).detail.output.uid;
                if (models && models[uid] && models[uid][index]) { // todo: make clearAll
                    models[uid][index].forEach((m: IModel) => disposeModel(m.modelObject));
                    models[uid][index] = [];
                }
                if(!models[uid]) models[uid] = [];
                models[uid][index] = ms;
                models[uid][index].forEach((m: IModel) => makeDiamonds(m.modelObject, viewer.getPlugin(DiamondPlugin)!));
                viewer.setDirty();
            });
    });
    document.dispatchEvent(new CustomEvent("modelLoad", {}));
    const viewer = await setupCoreWebGiViewer(
        {canvas: document.getElementById("mcanvas") as HTMLCanvasElement},
        {}
    )
    ;(window as any).viewer = viewer;
    viewer.getPlugin(ProgressivePlugin)!.maxFrameCount = 200;
    viewer.scene.modelRoot.modelObject.scale.set(0.1, 0.1, 0.1);
    const ee =
        "https://hdrhaven-proxy-1.repalash.workers.dev/file/ph-assets/HDRIs/hdr/1k/paul_lobe_haus_1k.hdr";
    const ee2 =
        "https://storage.googleapis.com/demo-assets.pixotronics.com/pixo/hdr/gem_2.hdr";
    const env = await viewer
        .getManager()!
        .importer!.importSinglePath<ITexture>(ee2)
    await viewer.scene.setEnvironment(env);
    return viewer;
}
