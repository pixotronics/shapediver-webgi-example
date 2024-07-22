import {
    DiamondMaterial,
    DiamondPlugin,
    IModel,
    Mesh,
    MeshStandardMaterial2,
    Object3D,
    ViewerApp
} from 'webgi';

// #region Functions (1)

export function processModel(ms: IModel, viewer: ViewerApp) {
    // create a material library from the names of the materials in the creation dictionary
    const materialLibrary: { [key: string]: Object3D[] } = Object.keys(materialCreationDictionary).reduce((acc: { [key: string]: Object3D[] }, key: string) => {
        acc[key] = [];
        return acc;
    }, {});

    // for every object in the model, check if it belongs to a defined material library
    // if it does, store it in the material library
    ms.modelObject.traverse((child: any) => {
        const materialKeys = Object.keys(materialCreationDictionary);
        for (let i = 0; i < materialKeys.length; i++) {
            const key = materialKeys[i];
            if (child.name.startsWith(key)) {
                materialLibrary[key].push(child);
                break;
            }
        }
    })

    // for every object that is stored in the material library, apply the material creator
    Object.keys(materialLibrary).forEach(key => {
        materialLibrary[key].forEach(s => s.traverse((o: any) => materialCreationDictionary[key](viewer, o)));
    });
}

// #endregion Functions (1)

// #region Variables (3)

/**
 * Make a gem stone material
 * 
 * @param viewer 
 * @param child 
 * @param accent 
 */
const makeGemStone = (viewer: ViewerApp, child: Mesh<any, DiamondMaterial>, accent = false) => {
    child.material.name = 'Gem'
    if (accent) child.material.name += ' 01'
    viewer.getPlugin(DiamondPlugin)!.makeDiamond(child.material, { cacheKey: accent.toString(), normalMapRes: accent ? 256 : 512 }, {})

    child.material.color.set(0xe4e4e4)
    child.material.envMapIntensity = 1.5
    child.material.dispersion = 0.004
    child.material.gammaFactor = 1.09
    child.material.reflectivity = 0.46
    child.material.rayBounces = 8
    child.material.boostFactors.set(2, 2, 2)
}

/**
 * Make a metal material
 * 
 * @param viewer 
 * @param child 
 */
const makeMetal = (viewer: ViewerApp, child: Mesh<any, MeshStandardMaterial2>) => {
    child.material.metalness = 1;
    child.material.roughness = 0;
    child.material.color.set(0xcacaca);
    child.material.name = 'Metal'
}

/**
 * Dictionary of material creators
 * 
 * The key is the name of the material in the model
 * The value is a function that takes a viewer and a mesh and applies a material to it
 */
const materialCreationDictionary: {
    [key: string]: (viewer: ViewerApp, child: Mesh<any, any>) => void
} = {
    "stone": (viewer: ViewerApp, child: Mesh<any, any>) => {
        if (!child.material || child.material.userData.__processed) return;
        makeGemStone(viewer, child, false)
        child.material.userData.__processed = true
    },
    "accentStones": (viewer: ViewerApp, child: Mesh<any, any>) => {
        if (!child.material || child.material.userData.__processed) return;
        makeGemStone(viewer, child, true)
        child.material.userData.__processed = true
    },
    "metal": (viewer: ViewerApp, child: Mesh<any, any>) => {
        if (!child.material || child.material.userData.__processed) return;
        makeMetal(viewer, child)
        child.material.userData.__processed = true
    },
    "engraving": (viewer: ViewerApp, child: Mesh<any, any>) => {
        if (!child.material || child.material.userData.__processed) return;
        child.material.metalness = 1;
        child.material.roughness = 0;
        child.material.transparent = true
        child.material.setDirty()
        child.material.userData.__processed = true
    },
    "ground": (viewer: ViewerApp, child: Mesh<any, any>) => {
        child.visible = false
    }
};

// #endregion Variables (3)
