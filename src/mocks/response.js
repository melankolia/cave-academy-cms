import { HttpResponse } from "msw";

export const Response = {
  success(data, meta) {
    return HttpResponse.json({
      traceId: "",
      message: "OK",
      validationErrors: [
        {
          field: "",
          message: "",
        },
      ],
      meta,
      data,
    });
  },
};
