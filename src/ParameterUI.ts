import { ShapeDiverResponseParameter } from "@shapediver/sdk.geometry-api-sdk-v2";
import type {IUiConfigContainer, UiObjectConfig} from "webgi";

/**
 * Uses the parameters of the initial responseDto to create an UI
 *
 * onchange listeners are connected to the provided callback
 */
export class ParameterUI implements IUiConfigContainer{
  readonly parameterValues: { [key: string]: string } = {};

  uiConfig: UiObjectConfig;
  constructor(
    parameters: {
      [id: string]: ShapeDiverResponseParameter;
    },
    parent: HTMLDivElement,
    parameterUpdateCallback: (parameters: {
      [key: string]: string;
    }) => Promise<void>
  ) {

    this.uiConfig = {
      type: "folder",
      label: "ShapeDiver",
      expanded: true,
      children: [],
    }

    let props: {
      [key: string]: any
    } = {};

    for (let p in parameters) {
      // get the parameter and assign the properties
      const parameterObject = parameters[p];
      this.parameterValues[parameterObject.id] = parameterObject.defval;
      props[p] = parameterObject.defval;

      if (
        parameterObject.type === "Int" ||
        parameterObject.type === "Float" ||
        parameterObject.type === "Even" ||
        parameterObject.type === "Odd"
      ) {
        // cast to number
        props[p] = +parameterObject.defval;

        // calculate stepSize
        let stepSize = 1;
        if (parameterObject.type === "Int")
          stepSize = 1;
        else if (parameterObject.type === "Even" ||parameterObject.type === "Odd")
          stepSize = 2;
        else
          stepSize = 1 / Math.pow(10, parameterObject.decimalplaces!);


        this.uiConfig.children?.push({
          uuid: parameterObject.id,
          type: "slider",
          label: parameterObject.name,
          property: [props, p],
          bounds: [parameterObject.min!, parameterObject.max!],
          stepSize,
          onChange: (ev:any) => {
            if(!ev.last) return;
            this.parameterValues[parameterObject.id] = parameterObject.decimalplaces !== undefined ? props[p].toFixed(parameterObject.decimalplaces) : props[p];
            parameterUpdateCallback(this.parameterValues);
          }
        })
      } else if (parameterObject.type === "Bool") {
        this.uiConfig.children?.push({
          uuid: parameterObject.id,
          type: "checkbox",
          label: parameterObject.name,
          property: [props, p],
          onChange: () => {
            this.parameterValues[parameterObject.id] = props[p];
            parameterUpdateCallback(this.parameterValues);
          }
        })
      } else if (parameterObject.type === "String") {
        this.uiConfig.children?.push({
          uuid: parameterObject.id,
          type: "input",
          label: parameterObject.name,
          property: [props, p],
          onChange: () => {
            this.parameterValues[parameterObject.id] = props[p];
            parameterUpdateCallback(this.parameterValues);
          }
        })
      } else if (parameterObject.type === "Color") {
        this.uiConfig.children?.push({
          uuid: parameterObject.id,
          type: "color",
          label: parameterObject.name,
          property: [props, p],
          onChange: (ev: any) => {
            if(!ev.last) return;
            this.parameterValues[parameterObject.id] =  props[p].replace("#", "0x");
            parameterUpdateCallback(this.parameterValues);
          }
        })
      } else if (parameterObject.type === "StringList") {
        // cast to number
        props[p] = +parameterObject.defval;

        const children: (UiObjectConfig<any> | (() => UiObjectConfig<any> | UiObjectConfig<any>[]))[] | undefined = [];
        for (let j = 0; j < parameterObject.choices!.length; j++) {
          children.push({
            label: parameterObject.choices![j],
            value: j,
          })
        }

        this.uiConfig.children?.push({
          uuid: parameterObject.id,
          type: "dropdown",
          label: parameterObject.name,
          property: [props, p],
          children,
          onChange: () => {
            this.parameterValues[parameterObject.id] = props[p];
            parameterUpdateCallback(this.parameterValues);
          }
        })
      }
    }
  }
}
