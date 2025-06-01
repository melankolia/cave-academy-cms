import { HttpResponse } from "msw";

export const Response = {
  success(data, meta) {
    return HttpResponse.json({
      message: "OK",
      data,
    });
  },
};
