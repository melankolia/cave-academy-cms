import { http } from "msw";
import { Response } from "../response";
import { LOGIN, LOGOUT } from "@/service/Instance/constants";
import { faker } from "@faker-js/faker";

export const handlers = [
  http.post(LOGIN, async ({ request, params, cookies }) => {
    const requestBody = await request.json();

    return Response.success({
      status: "success",
      message: "Logged in",
      user: {
        id: faker.number.int({ min: 10, max: 10000 }),
        role: "Admin",
        name: "Admin",
        username: requestBody.username,
      },
    });
  }),
  http.post(LOGOUT, async ({ request, params, cookies }) => {
    return Response.success();
  }),
];
