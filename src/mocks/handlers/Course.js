import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import { COURSE } from "@/service/Instance/constants";

export const handlers = [
  http.get(COURSE, async ({ request, params, cookies }) => {
    return Response.success(
      {
        courses: [
          {
            id: faker.number.int({ min: 10, max: 10000 }),
            store: {
              id: faker.number.int({ min: 10, max: 100 }),
              name: faker.company.name(),
            },
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            good_goods_count: faker.number.int({ min: 10, max: 100 }),
            defective_goods_count: faker.number.int({ min: 10, max: 100 }),
            available_variant_count: faker.number.int({ min: 10, max: 100 }),
            empty_variant_count: faker.number.int({ min: 10, max: 100 }),
            freezer_state: "Clean",
            freezer_positioning: "Acceptable",
            freezer_capacity_status: "40-60",
            is_pop_promo_displayed: faker.datatype.boolean(),
            is_freezer_pricetag_displayed: faker.datatype.boolean(),
            is_island_pricetag_displayed: faker.datatype.boolean(),
          },
        ],
      },
      {
        page: 1,
        limit: 10,
        totalRows: 1,
      }
    );
  }),
  http.get(`${COURSE}/:id`, async ({ request, params, cookies }) => {
    return Response.success({
      course: {
        id: faker.number.int({ min: 10, max: 10000 }),
        store_id: faker.number.int({ min: 10, max: 10000 }),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        good_goods_count: faker.number.int({ min: 10, max: 10000 }),
        defective_goods_count: faker.number.int({ min: 10, max: 10000 }),
        available_variant_count: faker.number.int({ min: 10, max: 10000 }),
        empty_variant_count: faker.number.int({ min: 10, max: 10000 }),
        freezer_state: "Clean",
        freezer_positioning: "Acceptable",
        freezer_capacity_status: "40-60",
        is_pop_promo_displayed: faker.datatype.boolean(),
        is_freezer_pricetag_displayed: faker.datatype.boolean(),
        is_island_pricetag_displayed: faker.datatype.boolean(),
      },
    });
  }),
];
