import {DiamondMaterial, DiamondPlugin, IModel, Mesh, MeshStandardMaterial2, Object3D, ViewerApp} from 'webgi'

export function processModel(ms: IModel, viewer: ViewerApp) {
    const stoneParents: Object3D[] = []
    const metalParents: Object3D[] = []
    const stone2Parents: Object3D[] = []
    const engravingParents: Object3D[] = []
    ms.modelObject.traverse((child: any)=>{
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
}
