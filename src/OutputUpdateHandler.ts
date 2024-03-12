import { ShapeDiverResponseOutput } from "@shapediver/sdk.geometry-api-sdk-v2";

/**
 * This handler will be called by SessionManager
 * whenever the contents of an output change in response
 * to a customization request.
 * Think of an output like a channel through which a ShapeDiver model
 * outputs data.
 * @param outputVersion The output which holds new content
 * @param materialOutputVersion Optional output which defines the
 * default material(s) to apply to the content items of outputVersion
 */
const OutputUpdateHandler = async (
  outputVersion: ShapeDiverResponseOutput,
  materialOutputVersion?: ShapeDiverResponseOutput
) => {
  /**
   * Outputs can be identified using the following properties:
   *
   *   * id - an id which is globally unique and changes every time a model is re-uploaded to ShapeDiver
   *   * name - name assigned to the output in Grasshopper
   *   * uid - unique id which stays constant across multiple uploads of the model to ShapeDiver
   *
   * Typically uid or name will be most useful in your application.
   * Note that uid will be undefined for older models, re-upload your model in this case.
   */
  const id = outputVersion.id;
  const name = outputVersion.name;
  const uid = outputVersion.uid;

  console.log("outputupdatehandler");
  /**
   * --> In case you are implementing a custom viewer:
   *
   *   * Use the properties mentioned above to define a unique identifier
   *     for the scene tree node corresponding to the output.
   *   * Check if a node with the identifier already exists, and
   *     don't forget to remove it before inserting updated geometry.
   */

  /**
   * The version is a hash value computed based on
   * the parameter values which influence this output.
   */
  const version = outputVersion.version;

  /**
   * content is an array which contains the actual data coming out of the
   * given output, for the parameter values which were used in the
   * customization request.
   * Note that content may be an empty array.
   */
  const content = outputVersion.content;

  const numOfItems = !content ? 0 : content.length;

  console.log(
    `Updating output id ${id}, uid ${uid}, name ${name}, version ${version}, content items: ${numOfItems}`
  );

  if (numOfItems === 0) return;

  /**
   * The content items of the optional materialOutputVersion define
   * the default material(s) to be applied to geometric assets.
   */
  const materials =
    materialOutputVersion?.content?.filter(
      (item) => item.format === "material"
    ) || [];

  /** Iterate content items */
  for (let i = 0; i < content!.length; i++) {
    const item = content![i];

    /**
     * Optional material assigned to the item.
     * If there are less materials than items,
     * the last material applies.
     */
    const material =
      materials.length === 0
        ? undefined
        : materials[Math.min(materials.length - 1, i)];

    /**
     * Each item has a format which defines the type of data
     * represented by the item.
     */

    switch (item.format) {
      case "gltf":
        /**
         * format "gltf"
         *
         * item.href points to a glTF 2.0 asset
         * item.transformations may contain an array of transformations to be applied
         *
         * material defines the default material to be applied.
         *
         * --> In case you are implementing a custom viewer:
         *
         *   * Load the glTF.
         *   * Apply the default material to any object without
         *     material assigned by the glTF.
         *   * If item.transformations is defined, create one
         *     instance of the geometry for each of the transformations.
         *   * Don't forget to remove geometry inserted by previous calls
         *     of this function for this output.
         */
        console.log(
          `Content item ${i + 1}/${numOfItems}, glTF 2.0 asset`,
          item,
          "Default material",
          material,
            outputVersion,
        );
        document.dispatchEvent(
          new CustomEvent("modelLoad", { detail: { item, i, output: outputVersion } })
        );
        break;

      case "material":
        /**
         * format "material"
         *
         * item.data contains a ShapeDiver material definition.
         */
        console.log(
          `Content item ${i + 1}/${numOfItems}, material definition`,
          item
        );
        break;

      case "sdtf":
        /**
         * format "sdtf"
         *
         * item.href points to an sdTF asset.
         */
        console.log(`Content item ${i + 1}/${numOfItems}, sdTF asset`, item);
        break;

      case "glb":
        /**
         * format "glb"
         *
         * item.href points to a glTF 1.0 asset including a custom
         *           extension by ShapeDiver. Note that these assets
         *           won't load using commonly available glTF loaders.
         *           Update your Grasshopper models to use the latest
         *           display components instead.
         *
         * material defines the default material to be applied.
         */
        console.log(
          `Content item ${i + 1}/${numOfItems}, glTF glb 2.0 asset`,
          item,
          "Default material",
          material,
            outputVersion
        );
        console.warn('Loading glTF glb 2.0 asset')
        document.dispatchEvent(
            new CustomEvent("modelLoad", { detail: { item, i, output: outputVersion } })
        );

        break;

      case "tag2d":
        /**
         * format "tag2d"
         *
         * item.data contains 2D text tag definitions.
         */
        console.log(`Content item ${i + 1}/${numOfItems}, 2D text tag`, item);
        break;

      case "tag3d":
        /**
         * format "tag3d"
         *
         * item.data contains 3D text tag definitions.
         */
        console.log(`Content item ${i + 1}/${numOfItems}, 3D text tag`, item);
        break;

      case "data":
        /**
         * format "data"
         *
         * item.data contains arbitrary data.
         */
        console.log(`Content item ${i + 1}/${numOfItems}, data`, item);
        break;

      default:
        console.log(
          `Content item ${i + 1}/${numOfItems}, unknown format`,
          item
        );
        break;
    }
  }
};

export { OutputUpdateHandler };
