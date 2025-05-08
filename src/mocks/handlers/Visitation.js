import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import {
  VISITATION,
  VISITATION_SALES_SEARCH,
  VISITATION_STORES_SEARCH,
} from "@/service/Instance/constants";

export const handlers = [
  http.get(VISITATION, async ({ request, params, cookies }) => {
    return Response.success(
      {
        visitations: [
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
            freezer_state: "Not Clean",
            freezer_positioning: "Acceptable",
            freezer_capacity_status: "40-60",
            is_pop_promo_displayed: faker.datatype.boolean(),
            is_freezer_pricetag_displayed: faker.datatype.boolean(),
            is_island_pricetag_displayed: faker.datatype.boolean(),
          },
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
            freezer_state: "Dirty",
            freezer_positioning: "Acceptable",
            freezer_capacity_status: "40-60",
            is_pop_promo_displayed: faker.datatype.boolean(),
            is_freezer_pricetag_displayed: faker.datatype.boolean(),
            is_island_pricetag_displayed: faker.datatype.boolean(),
          },
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
  http.get(`${VISITATION}/:id`, async ({ request, params, cookies }) => {
    return Response.success({
      visitation: {
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

      visitation_images: [
        {
          type: "Store",
          image_url: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
        },
        {
          type: "Freezer",
          image_url: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
        },
        {
          type: "Freezer Product",
          image_url: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
        },
      ],
      store: {
        name: faker.company.name(),
        phone_number: faker.phone.number({ style: "national" }),
        freezer_idn: "",
      },
    });
  }),
  http.get(VISITATION_SALES_SEARCH, async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";

    const count = faker.number.int({ min: 5, max: 10 });
    const salesEmployees = Array.from({ length: count }, () => ({
      id: faker.number.int({ min: 1000, max: 9999 }),
      full_name: faker.person.fullName(),
    })).filter(
      (employee) =>
        query === "" ||
        employee.full_name.toLowerCase().includes(query.toLowerCase())
    );

    return Response.success(salesEmployees);
  }),
  http.get(VISITATION_STORES_SEARCH, async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";

    const count = faker.number.int({ min: 5, max: 10 });
    const stores = Array.from({ length: count }, () => ({
      id: faker.number.int({ min: 1000, max: 9999 }),
      name: faker.company.name(),
      address: faker.location.streetAddress(),
    })).filter(
      (store) =>
        query === "" || store.name.toLowerCase().includes(query.toLowerCase())
    );

    return Response.success(stores);
  }),
];
