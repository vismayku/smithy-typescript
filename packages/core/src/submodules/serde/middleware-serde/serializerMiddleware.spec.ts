import type { EndpointBearer, SerdeFunctions } from "@smithy/types";
import { beforeEach, describe, expect, test as it, vi } from "vitest";

import { serializerMiddleware } from "./serializerMiddleware";

describe("serializerMiddleware", () => {
  const mockNext = vi.fn();
  const mockSerializer = vi.fn();

  const mockOptions = {
    endpoint: () =>
      Promise.resolve({
        protocol: "protocol",
        hostname: "hostname",
        path: "path",
      }),
  } as EndpointBearer & SerdeFunctions;

  const mockRequest = {
    method: "GET",
    headers: {},
  };

  const mockResponse = {
    statusCode: 200,
    headers: {},
  };

  const mockOutput = {
    $metadata: {
      statusCode: 200,
      requestId: "requestId",
    },
    outputKey: "outputValue",
  };

  const mockReturn = {
    response: mockResponse,
    output: mockOutput,
  };

  const mockArgs = {
    input: {
      inputKey: "inputValue",
    },
  };

  beforeEach(() => {
    mockNext.mockResolvedValueOnce(mockReturn);
    mockSerializer.mockResolvedValueOnce(mockRequest);
  });

  it("calls serializer and populates request object", async () => {
    await expect(serializerMiddleware(mockOptions, mockSerializer)(mockNext, {})(mockArgs)).resolves.toStrictEqual(
      mockReturn
    );

    expect(mockSerializer).toHaveBeenCalledTimes(1);
    expect(mockSerializer).toHaveBeenCalledWith(mockArgs.input, mockOptions);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith({ ...mockArgs, request: mockRequest });
  });

  it("records serialization time on the context recorder when present", async () => {
    const recorder = { addTime: vi.fn() };
    await serializerMiddleware(mockOptions, mockSerializer)(mockNext, { recorder } as any)(mockArgs);

    expect(recorder.addTime).toHaveBeenCalledWith("SerializationTime", expect.any(Number));
  });
});
