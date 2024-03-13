import {CoreViewerApp, DiamondPlugin, IModel, LoadingScreenPlugin, ViewerApp} from "webgi";

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
        const name = (ev as any).detail.output.name
        viewer.load((ev as any).detail.item.href + "#file" + iii + ".glb", {autoScale: false, pseudoCenter: false})
            .then((ms) => {
                console.log(ms)
                ms.name = name
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

                ms.traverse((child: any)=>{
                    if(!child.material || child.material.userData.__processed) return;
                    if(child.material?.name === 'ground'){
                        child.visible = false
                        return
                    }
                    const parts = child.material.name.split('.')
                    console.log(child.material?.name, name, parts)
                    if(parts[0] === 'gemstone') {
                        child.material.name = 'Gem'
                        const size = parts[2]
                        if(size !== 'big') child.material.name += ' 01'
                        viewer.getPlugin(DiamondPlugin)!.makeDiamond(child.material, {cacheKey: parts[1], normalMapRes: 512}, {})

                        child.material.envMapIntensity = 1.5
                        child.material.dispersion = 0.004
                        child.material.gammaFactor = 1.09
                        child.material.reflectivity = 0.46
                        child.material.rayBounces = 8
                        // child.material.boostFactors.set(2, 2, 2)

                    }else {
                        child.material.metalness = 1;
                        child.material.roughness = 0;
                        child.material.name = 'Metal'
                    }
                    child.material.userData.__processed = true
                })

                viewer.setDirty();

                viewer.fitToView()
            });
    });
    document.dispatchEvent(new CustomEvent("modelLoad", {}));
    const viewer = new CoreViewerApp(
        {canvas: document.getElementById("mcanvas") as HTMLCanvasElement},
    )

    await viewer.initialize({})
    viewer.getPlugin(LoadingScreenPlugin)!.showFileNames = false;
    ;(window as any).viewer = viewer;
    viewer.scene.modelRoot.modelObject.scale.set(0.1, 0.1, 0.1);
    return viewer;
}
