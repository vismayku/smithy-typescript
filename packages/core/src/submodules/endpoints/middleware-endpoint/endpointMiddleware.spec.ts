import type { HandlerExecutionContext } from "@smithy/types";
import { describe, expect, test as it, vi } from "vitest";

import { bindEndpointMiddleware } from "./endpointMiddleware";

describe("endpointMiddleware", () => {
  const endpoint = { url: new URL("https://localhost") };
  const config = {
    isCustomEndpoint: false,
    endpointProvider: vi.fn().mockReturnValue(endpoint),
  } as any;
  const instructions = {};

  const endpointMiddleware = bindEndpointMiddleware(async () => undefined);

  it("records endpoint resolution time on the context recorder when present", async () => {
    const recorder = { addTime: vi.fn() };
    const next = vi.fn().mockResolvedValue({ output: {} });

    await endpointMiddleware({ config, instructions })(next, { recorder } as unknown as HandlerExecutionContext)({
      input: {},
      request: {} as any,
    });

    expect(recorder.addTime).toHaveBeenCalledWith("EndpointResolutionTime", expect.any(Number));
  });
});
