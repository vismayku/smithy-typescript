import type { Pluggable } from "@smithy/types";

import { metricsMiddleware, metricsMiddlewareOptions } from "./metricsMiddleware";

/**
 * @internal
 */
export const getMetricsPlugin = (): Pluggable<any, any> => ({
  applyToStack: (clientStack) => {
    clientStack.add(metricsMiddleware(), metricsMiddlewareOptions);
  },
});
