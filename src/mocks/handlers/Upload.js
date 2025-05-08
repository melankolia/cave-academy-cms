import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import { IMAGE_UPLOAD } from "@/service/Instance/constants";

export const handlers = [
  http.post(IMAGE_UPLOAD, async ({ request, params, cookies }) => {
    return Response.success({
      url: faker.image.url(),
    });
  }),
];
