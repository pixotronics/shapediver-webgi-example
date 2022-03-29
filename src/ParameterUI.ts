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

    const props = {
      param1: 0.5,
      param2: '#ff00ff',
      param3: 'option2',
    }
    this.uiConfig = {
      type: "folder",
      label: "Shape Diver",
      children: [ // create the children list dynamically.
        {
          type: 'slider', // slider, checkbox, dropdown, color, image, folder, or input(text/number)
          label: 'Parameter 1',
          property: [props, 'param1'], // get/set the param1 property from the props object
          onChange: ()=>{
            console.log(props)
          },
          bounds: [0,1], // required for slider, otherwise optional
          step: 0.01,
        },
        {
          type: 'color', // slider, checkbox, dropdown, color, image, folder, or input(text/number)
          label: 'Parameter 2',
          property: [props, 'param2'], // get/set the param1 property from the props object
          onChange: ()=>{
            console.log(props)
          },
        },
        {
          type: 'dropdown', // slider, checkbox, dropdown, color, image, folder, or input(text/number)
          label: 'Parameter 3',
          property: [props, 'param3'], // get/set the param1 property from the props object
          children: [
          {
            label: 'Option 1', // string, optional
            value: 'option1', // any serializable value
          },
          {
            label: 'Option 2',
            value: 'option2',
          },
          {
            label: 'Option 3',
            value: 'option3',
          },
          ],
          onChange: ()=>{
            console.log(props)
          },
        },
      ],
    }

    for (let p in parameters) {
      // get the parameter and assign the properties
      const parameterObject = parameters[p];
      this.parameterValues[parameterObject.id] = parameterObject.defval;

      const paramDiv = document.createElement("div");
      const label = document.createElement("label");
      label.setAttribute("for", parameterObject.id);
      label.innerHTML = parameterObject.name;

      // for the different types of the parameter, we need different inputs, or at least different options for inputs

      let parameterInputElement:
        | HTMLInputElement
        | HTMLSelectElement
        | null = null;
      if (
        parameterObject.type === "Int" ||
        parameterObject.type === "Float" ||
        parameterObject.type === "Even" ||
        parameterObject.type === "Odd"
      ) {
        parameterInputElement = document.createElement("input");
        parameterInputElement.setAttribute("id", parameterObject.id);
        parameterInputElement.setAttribute("type", "range");
        parameterInputElement.setAttribute("min", parameterObject.min + "");
        parameterInputElement.setAttribute("max", parameterObject.max + "");
        parameterInputElement.setAttribute("value", parameterObject.defval);

        if (parameterObject.type === "Int")
          parameterInputElement.setAttribute("step", "1");
        else if (
          parameterObject.type === "Even" ||
          parameterObject.type === "Odd"
        )
          parameterInputElement.setAttribute("step", "2");
        else
          parameterInputElement.setAttribute(
            "step",
            1 / Math.pow(10, parameterObject.decimalplaces!) + ""
          );

        // onchange listener
        parameterInputElement.onchange = async () => {
          this.parameterValues[
            parameterInputElement!.id
          ] = parameterInputElement!.value;
          await parameterUpdateCallback(this.parameterValues);
        };
      } else if (parameterObject.type === "Bool") {
        parameterInputElement = document.createElement("input");
        parameterInputElement.setAttribute("id", parameterObject.id);
        parameterInputElement.setAttribute("type", "checkbox");
        parameterInputElement.setAttribute("checked", parameterObject.defval);

        // onchange listener
        parameterInputElement.onclick = async () => {
          this.parameterValues[parameterInputElement!.id] =
            (<HTMLInputElement>parameterInputElement)!.checked + "";
          await parameterUpdateCallback(this.parameterValues);
        };
      } else if (parameterObject.type === "String") {
        parameterInputElement = document.createElement("input");
        parameterInputElement.setAttribute("id", parameterObject.id);
        parameterInputElement.setAttribute("type", "text");
        parameterInputElement.setAttribute("value", parameterObject.defval);

        // onchange listener
        parameterInputElement.onchange = async () => {
          this.parameterValues[
            parameterInputElement!.id
          ] = parameterInputElement!.value;
          await parameterUpdateCallback(this.parameterValues);
        };
      } else if (parameterObject.type === "Color") {
        parameterInputElement = document.createElement("input");
        parameterInputElement.setAttribute("id", parameterObject.id);
        parameterInputElement.setAttribute("type", "color");
        parameterInputElement.setAttribute("value", parameterObject.defval);
        parameterInputElement.onselect = () => console.log("a");

        // onchange listener
        parameterInputElement.onchange = async () => {
          // value conversion to fit our types
          let value = parameterInputElement!.value;
          value = value.replace("#", "0x") + "ff";
          this.parameterValues[parameterInputElement!.id] = value;
          await parameterUpdateCallback(this.parameterValues);
        };
      } else if (parameterObject.type === "StringList") {
        parameterInputElement = document.createElement("select");
        parameterInputElement.setAttribute("id", parameterObject.id);
        for (let j = 0; j < parameterObject.choices!.length; j++) {
          let option = document.createElement("option");
          option.setAttribute("value", j + "");
          option.setAttribute("name", parameterObject.choices![j]);
          option.innerHTML = parameterObject.choices![j];
          if (+parameterObject.defval === j)
            option.setAttribute("selected", "");
          parameterInputElement.appendChild(option);
        }

        // onchange listener
        parameterInputElement.onchange = async () => {
          this.parameterValues[
            parameterInputElement!.id
          ] = parameterInputElement!.value;
          await parameterUpdateCallback(this.parameterValues);
        };
      }

      if (parameterInputElement) {
        if (parameterObject.hidden) paramDiv.setAttribute("hidden", "");
        paramDiv.appendChild(label);
        paramDiv.appendChild(parameterInputElement);
        parent.appendChild(paramDiv);
      }
    }
  }
}
