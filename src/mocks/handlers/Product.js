import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import { PRODUCT } from "@/service/Instance/constants";

export const handlers = [
  http.get(PRODUCT, async ({ request, params, cookies }) => {
    return Response.success(
      [
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
      ],
      {
        totalElements: 4,
      }
    );
  }),
  http.post(PRODUCT, async ({ request, params, cookies }) => {
    const requestBody = await request.json();

    return Response.success({
      secureId: faker.string.uuid(),
      ...requestBody,
    });
  }),
];
