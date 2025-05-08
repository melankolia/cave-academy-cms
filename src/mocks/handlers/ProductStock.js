import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import { PRODUCT_STOCK } from "@/service/Instance/constants";

export const handlers = [
  http.get(PRODUCT_STOCK, async ({ request, params, cookies }) => {
    return Response.success(
      [
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          distributorName: faker.company.name(),
          areaName: faker.location.city(),
          qty: faker.number.int({ min: 10, max: 100 }),
          price: faker.commerce.price({
            min: 1000,
            max: 10000,
            dec: 0,
            symbol: "IDR ",
          }),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          distributorName: faker.company.name(),
          areaName: faker.location.city(),
          qty: faker.number.int({ min: 10, max: 100 }),
          price: faker.commerce.price({
            min: 1000,
            max: 10000,
            dec: 0,
            symbol: "IDR ",
          }),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          distributorName: faker.company.name(),
          areaName: faker.location.city(),
          qty: faker.number.int({ min: 10, max: 100 }),
          price: faker.commerce.price({
            min: 1000,
            max: 10000,
            dec: 0,
            symbol: "IDR ",
          }),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
        {
          secureId: faker.string.uuid(),
          productName: faker.commerce.productName(),
          distributorName: faker.company.name(),
          areaName: faker.location.city(),
          qty: faker.number.int({ min: 10, max: 100 }),
          price: faker.commerce.price({
            min: 1000,
            max: 10000,
            dec: 0,
            symbol: "IDR ",
          }),
          createdTs: faker.date.past(),
          lastUpdatedTs: faker.date.past(),
        },
      ],
      {
        totalElements: 4,
      }
    );
  }),
];
