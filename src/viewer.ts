import {
    CoreViewerApp, DiamondMaterial,
    DiamondPlugin,
    IModel,
    LoadingScreenPlugin,
    Material,
    Mesh,
    MeshStandardMaterial2,
    Object3D,
    ViewerApp
} from "webgi";
// @ts-ignore
import sampleScene from '/sample_scene.vjson?url&asd1'

function disposeModel(model: any) {
    model.dispose();
}
// function makeDiamonds(model: any, diamondPlugin: DiamondPlugin) {
//     model.traverse((m: any) => {
//         if (m.material && m.material.name.startsWith("diamond_")) {
//             diamondPlugin.makeDiamond(m.material, { cacheKey: m.material.name }, {});
//         }
//     });
// }

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
                // models[uid][index].forEach((m: IModel) => makeDiamonds(m.modelObject, viewer.getPlugin(DiamondPlugin)!));

                const stoneParents: Object3D[] = []
                const metalParents: Object3D[] = []
                const stone2Parents: Object3D[] = []
                const engravingParents: Object3D[] = []
                ms.traverse((child: any)=>{
                    if(child.name === 'ground' || child.material?.name === 'ground'){
                        child.visible = false
                        return
                    }
                    if(child.name.startsWith('stone')) stoneParents.push(child)
                    else if(child.name.startsWith('accentStones')) stone2Parents.push(child)
                    else if(child.name.startsWith('metal')) metalParents.push(child)
                    else if(child.name.startsWith('engraving')) engravingParents.push(child)

                    if(!child.material || child.material.userData.__processed) return;

                    // const parts = child.material.name.split('.')
                    // console.log(child.material?.name, name, parts)
                })

                const makeStone = (child: Mesh<any, DiamondMaterial>, accent = false)=>{
                    child.material.name = 'Gem'
                    if(accent) child.material.name += ' 01'
                    viewer.getPlugin(DiamondPlugin)!.makeDiamond(child.material, {cacheKey: accent.toString(), normalMapRes: accent ? 256 : 512}, {})

                    child.material.color.set(0xe4e4e4)
                    child.material.envMapIntensity = 1.5
                    child.material.dispersion = 0.004
                    child.material.gammaFactor = 1.09
                    child.material.reflectivity = 0.46
                    child.material.rayBounces = 8
                    child.material.boostFactors.set(2, 2, 2)
                }

                const makeMetal = (child: Mesh<any, MeshStandardMaterial2>)=>{
                    child.material.metalness = 1;
                    child.material.roughness = 0;
                    child.material.color.set(0xcacaca);
                    child.material.name = 'Metal'
                }

                stoneParents.forEach(s=>s.traverse((o: any)=>{
                    if(!o.material || o.material.userData.__processed) return;
                    makeStone(o, false)
                    o.material.userData.__processed = true
                }))
                stone2Parents.forEach(s=>s.traverse((o: any)=>{
                    if(!o.material || o.material.userData.__processed) return;
                    makeStone(o, true)
                    o.material.userData.__processed = true
                }))
                metalParents.forEach(s=>s.traverse((o: any)=>{
                    if(!o.material || o.material.userData.__processed) return;
                    makeMetal(o)
                    o.material.userData.__processed = true
                }))
                engravingParents.forEach(s=>s.traverse((o: any)=>{
                    if(!o.material || o.material.userData.__processed) return;
                    o.material.metalness = 1;
                    o.material.roughness = 0;
                    o.material.transparent = true
                    o.material.setDirty()
                    o.material.userData.__processed = true
                }))

                // viewer.setDirty();

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
    viewer.load(sampleScene) // no await
    return viewer;
}
