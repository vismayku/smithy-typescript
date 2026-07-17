import type {
  AbsoluteLocation,
  HandlerExecutionContext,
  InitializeHandler,
  InitializeHandlerArguments,
  InitializeHandlerOptions,
  InitializeHandlerOutput,
  MetadataBearer,
} from "@smithy/types";

/**
 * Drives the per-request recording lifecycle for the recorder placed on the
 * execution context. It opens the recorder before the request, records the
 * outcome and duration, and closes it afterward. When no recorder is present
 * it is a no-op. The recorder itself is supplied by the caller (via the
 * call-site recorder on the context); this middleware does not create one.
 *
 * @internal
 */
export const metricsMiddleware =
  () =>
  <Output extends MetadataBearer = MetadataBearer>(
    next: InitializeHandler<any, Output>,
    context: HandlerExecutionContext
  ): InitializeHandler<any, Output> =>
  async (args: InitializeHandlerArguments<any>): Promise<InitializeHandlerOutput<Output>> => {
    const recorder = context.recorder;
    if (!recorder) {
      return next(args);
    }

    const start = Date.now();
    recorder.begin();
    try {
      const result = await next(args);
      recorder.recordRequestOutcome("Success", Date.now() - start);
      return result;
    } catch (error) {
      recorder.recordRequestOutcome("Fault", Date.now() - start);
      throw error;
    } finally {
      recorder.end();
    }
  };

/**
 * @internal
 */
export const metricsMiddlewareOptions: InitializeHandlerOptions & AbsoluteLocation = {
  name: "metricsMiddleware",
  tags: ["METRICS"],
  step: "initialize",
  priority: "high",
  override: true,
};
