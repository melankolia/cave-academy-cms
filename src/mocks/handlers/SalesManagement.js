import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import {
  CHANGE_PASSWORD,
  SALES_MANAGEMENT,
} from "@/service/Instance/constants";

export const handlers = [
  http.get(SALES_MANAGEMENT, async ({ request, params, cookies }) => {
    return Response.success(
      [
        {
          secureId: faker.string.uuid(),
          username: faker.internet.username(),
          email: faker.internet.email(),
          fullName: faker.person.fullName(),
        },
        {
          secureId: faker.string.uuid(),
          username: faker.internet.username(),
          email: faker.internet.email(),
          fullName: faker.person.fullName(),
        },
        {
          secureId: faker.string.uuid(),
          username: faker.internet.username(),
          email: faker.internet.email(),
          fullName: faker.person.fullName(),
        },
        {
          secureId: faker.string.uuid(),
          username: faker.internet.username(),
          email: faker.internet.email(),
          fullName: faker.person.fullName(),
        },
      ],
      {
        totalElements: 4,
      }
    );
  }),
  http.post(
    `${CHANGE_PASSWORD}/:secureId`,
    async ({ request, params, cookies }) => {
      const { secureId } = params;
      const requestBody = await request.json();

      return Response.success({
        id: secureId,
        ...requestBody,
      });
    }
  ),
];
