import type { HandlerExecutionContext, MetricsRecorder } from "@smithy/types";
import { describe, expect, test as it, vi } from "vitest";

import { metricsMiddleware } from "./metricsMiddleware";

describe("metrics middleware", () => {
  const createRecorder = () =>
    ({
      begin: vi.fn(),
      end: vi.fn(),
      recordRequestOutcome: vi.fn(),
      addCount: vi.fn(),
      addTime: vi.fn(),
      addLevel: vi.fn(),
      addMetric: vi.fn(),
      addRatio: vi.fn(),
      setProperty: vi.fn(),
      getMetrics: vi.fn(),
    }) as MetricsRecorder<any>;

  it("is a no-op when no recorder is on the context", async () => {
    const context = {} as HandlerExecutionContext;
    const next = vi.fn(async () => ({ output: {} })) as any;

    const result = await metricsMiddleware()(next, context)({} as any);

    expect(next).toHaveBeenCalledOnce();
    expect(result).toEqual({ output: {} });
  });

  it("opens, records a Success outcome, and closes around the request", async () => {
    const recorder = createRecorder();
    const context = { recorder } as HandlerExecutionContext;
    const next = vi.fn(async () => ({ output: {} })) as any;

    await metricsMiddleware()(next, context)({} as any);

    expect(recorder.begin).toHaveBeenCalledOnce();
    expect(recorder.recordRequestOutcome).toHaveBeenCalledWith("Success", expect.any(Number));
    expect(recorder.end).toHaveBeenCalledOnce();
  });

  it("records a Fault outcome and still closes when the request throws", async () => {
    const recorder = createRecorder();
    const context = { recorder } as HandlerExecutionContext;
    const failure = new Error("boom");
    const next = vi.fn(async () => {
      throw failure;
    }) as any;

    await expect(metricsMiddleware()(next, context)({} as any)).rejects.toThrow(failure);

    expect(recorder.begin).toHaveBeenCalledOnce();
    expect(recorder.recordRequestOutcome).toHaveBeenCalledWith("Fault", expect.any(Number));
    expect(recorder.end).toHaveBeenCalledOnce();
  });
});
