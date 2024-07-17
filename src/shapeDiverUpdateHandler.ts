import {AViewerPlugin, IModel, MathUtils, ViewerApp} from "webgi";
import {ShapeDiverResponseOutput, ShapeDiverResponseOutputContent} from '@shapediver/sdk.geometry-api-sdk-v2'

export class ShapeDiverUpdateHandler extends AViewerPlugin<''>{
    enabled = true
    public static readonly PluginType='ShapeDiverUpdateHandler'

    models: Record<string, IModel[][]> = {};

    processModel = (model: IModel, v: ViewerApp)=>{}

    onModelLoad = async (props: {item: ShapeDiverResponseOutputContent, i: number, output: ShapeDiverResponseOutput}) => {
        const viewer = this._viewer
        if (!viewer) return;
        console.warn('modelLoad', props);
        const name = props.output.name;
        const index = props.i;
        const uid = props.output.uid || MathUtils.generateUUID();

        const ms = await viewer.load(props.item.href + "#f" + index + ".glb", {autoScale: false, pseudoCenter: false})
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
        outputVersion: ShapeDiverResponseOutput
    ) => {
        const content = outputVersion.content;
        if (!content?.length) return;
        for (let i = 0; i < content.length; i++) {
            const item = content[i];
            switch (item.format) {
                case "gltf":
                case "glb":
                    return this.onModelLoad({ item, i, output: outputVersion })
            }
        }
    }
}
