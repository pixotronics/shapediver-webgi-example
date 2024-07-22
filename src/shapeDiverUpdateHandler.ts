import {AViewerPlugin, IModel, MathUtils, ViewerApp} from "webgi";
import { IOutputApi } from "@shapediver/viewer.session";

export class ShapeDiverUpdateHandler extends AViewerPlugin<''>{
    enabled = true
    public static readonly PluginType='ShapeDiverUpdateHandler'

    models: Record<string, IModel[][]> = {};

    processModel = (model: IModel, v: ViewerApp)=>{}

    onModelLoad = async (props: {outputApi: IOutputApi, i: number}) => {
        const viewer = this._viewer
        if (!viewer) return;
        console.warn('modelLoad', props);
        const name = props.outputApi.name;
        const index = props.i;
        const uid = props.outputApi.uid || MathUtils.generateUUID();

        const ms = await viewer.load(props.outputApi.content![props.i].href + "#f" + index + ".glb", {autoScale: false, pseudoCenter: false})
        ms.name = name
        if (this.models && this.models[uid] && this.models[uid][index]) { // todo: make clearAll
            this.models[uid][index].forEach((m: IModel) => m.modelObject.dispose());
            this.models[uid][index] = [];
        }
        if(!this.models[uid]) this.models[uid] = [];
        this.models[uid][index] = [ms];
        // models[uid][index].forEach((m: IModel) => makeDiamonds(m.modelObject, viewer.getPlugin(DiamondPlugin)!));
        this.processModel(ms, viewer)
        return viewer.fitToView()
    }

    outputUpdateHandler = async (
        outputApi: IOutputApi,
        materialOutputApi?: IOutputApi
    ) => {
        const content = outputApi.content;
        if (!content?.length) return;
        for (let i = 0; i < content.length; i++) {
            const item = content[i];
            switch (item.format) {
                case "gltf":
                case "glb":
                    return this.onModelLoad({ outputApi, i });
            }
        }
    }
}
