import {
  create,
  ShapeDiverResponseDto,
  ShapeDiverResponseOutput,
  ShapeDiverSdk
} from "@shapediver/sdk.geometry-api-sdk-v2";

/**
 * The SessionManager contains functionality to interpret
 * the information resulting from calls to the
 * ShapeDiver Geometry Backend API.
 */
export class SessionManager {
  readonly sdk: ShapeDiverSdk;
  defaultState?: ShapeDiverResponseDto;
  currentState?: ShapeDiverResponseDto;
  outputUpdateHandler?: (
    outputVersion: ShapeDiverResponseOutput,
    materialOutputVersion?: ShapeDiverResponseOutput
  ) => Promise<void>;

  customizationCounter = 0;

  /**
   *
   * @param ticket Ticket for embedding, find it in your dashboard on shapediver.com/app
   * @param modelViewUrl model view url, find it in your dashboard on shapediver.com/app
   */
  constructor(readonly ticket: string, readonly modelViewUrl: string) {
    this.sdk = create(modelViewUrl);
  }

  /**
   * Creates a session with the model identified by the ticket,
   * and processes the default output versions.
   */
  public async init() {
    this.defaultState = await this.sdk.session.init(this.ticket);
    this.currentState = this.defaultState;
    await this.processOutputUpdates(this.defaultState, this.currentState, true);
  }

  /**
   * Processing of output updates. Compares states of outputs and
   * calls the handler for output updates in case of changes.
   * @param newState Response which contains the new status
   * @param prevState Response which contains the previous status
   * @param forceUpdate Whether calling the output update handler should be forced
   */
  private async processOutputUpdates(
    newState: ShapeDiverResponseDto,
    prevState: ShapeDiverResponseDto,
    forceUpdate: boolean
  ) {
    /** iterate output ids and check for new versions */
    for (let o in newState.outputs) {
      const outputVersion = <ShapeDiverResponseOutput>newState.outputs[o];
      const prevOutputVersion = <ShapeDiverResponseOutput>prevState.outputs![o];

      /**
       * here we check the output version
       * if the version is the same as the previous one,
       * the data of the output stays the same
       */
      if (
        this.outputUpdateHandler &&
        (forceUpdate || outputVersion.version !== prevOutputVersion.version)
      ) {
        /**
         * call the handler using the updated output,
         * and the optional output which defines its default materials
         */
        this.outputUpdateHandler(
          outputVersion,
          outputVersion.material
            ? <ShapeDiverResponseOutput>newState.outputs[outputVersion.material]
            : outputVersion
        );
      }
    }
  }

  /**
   * Customize the session using the provided parameter set
   *
   * @param parameters Key value pairs of parameter id and stringified parameter value
   */
  public async customizeSession(parameters: { [key: string]: string }) {
    console.log("Parameter values", parameters);
    const customizationCounter = ++this.customizationCounter;

    const newState = await this.sdk.utils.submitAndWaitForCustomization(
      this.sdk,
      this.defaultState!.sessionId!,
      parameters
    );

    /**
     * If another customization request has been made, we stop our progress and
     * abort this request.
     * Additionally, you could change requests to get all results.
     */
    if (this.customizationCounter !== customizationCounter) return;

    const currentState = this.currentState;
    this.currentState = newState;
    await this.processOutputUpdates(newState, currentState!, false);
  }
}
