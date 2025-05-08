<script setup>
  import { ref, reactive, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useToast } from "primevue/usetoast";
  import VisitationService from "@/service/VisitationService";
  import SkeletonCard from "@/components/Skeleton/Card.vue";

  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const visitationService = reactive(new VisitationService());
  const loading = ref(false);

  const breadcrumbHome = ref({ icon: "pi pi-home", route: "/" });
  const breadcrumbItems = ref([
    { label: "Visitation", route: "/visitation" },
    { label: "Visitation Detail", route: `/visitation/${route.params.id}` },
  ]);

  const visitationData = ref({
    store: {
      name: null,
      phone_number: null,
      freezer_idn: null,
    },
    visitation: {
      id: null,
      good_goods_count: null,
      defective_goods_count: null,
      available_variant_count: null,
      empty_variant_count: null,
      freezer_state: null,
      freezer_gap_state: null,
      freezer_glass_state: null,
      freezer_thermometer_state: null,
      is_pop_promo_displayed: null,
      is_freezer_pricetag_displayed: null,
      is_island_pricetag_displayed: null,
    },
    visitation_images: [],
  });

  const getDetail = async () => {
    try {
      loading.value = true;
      const id = route.params?.id;

      const {
        data: { data },
        status,
      } = await visitationService.details(id);

      if (status == 200) {
        const visitation_images = data.visitation_images.map((item) => ({
          itemImageSrc: item.image_url,
          type: item.type,
        }));

        visitationData.value = { ...data, visitation_images };

        breadcrumbItems.value = [
          { label: "Visitation", route: "/visitation" },
          { label: `#${id}`, route: `/visitation/${id}` },
        ];
      } else {
        throw new Error("Failed to fetch data!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to fetch data!",
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const onBack = () => {
    router.push("/visitation");
  };

  const openMap = (item) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${item?.latitude},${item?.longitude}`,
      "_blank"
    );
  };
  onMounted(() => {
    getDetail();
  });
</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6" style="padding: 2px">
        <template #start>
          <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems">
            <template #item="{ item, props }">
              <router-link v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href="href" v-bind="props.action" @click="navigate">
                  <span :class="[item.icon, 'text-color']" />
                  <span>
                    {{ item.label }}
                  </span>
                </a>
              </router-link>
            </template>
          </Breadcrumb>
        </template>
      </Toolbar>
      <div v-if="loading">
        <Skeleton class="mt-8 mb-6" width="10rem" height="2rem" />
        <SkeletonCard />
      </div>
      <template v-else>
        <div class="font-semibold text-xl mb-4">Visitation Detail</div>
        <div class="flex flex-col gap-4 w-full">
          <Fieldset legend="Store">
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-1/2"
                name="store_name"
                label="Name"
                :values="visitationData.store?.name"
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-1/2"
                name="store_phone_number"
                label="Phone Number"
                :values="visitationData.store?.phone_number"
              />
            </div>
          </Fieldset>
          <Fieldset legend="Item">
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="goods_condition"
                label="Condition"
                :values="visitationData.visitation?.goods_condition"
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="goods_notes"
                label="Notes"
                :values="visitationData.visitation?.goods_notes || '-'"
              />
            </div>
          </Fieldset>
          <Fieldset legend="Variant">
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-1/2 mt-4"
                name="variant_count"
                label="Total"
                :values="visitationData.visitation?.variant_count"
              />
            </div>
          </Fieldset>
          <Fieldset legend="Freezer">
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_state"
                label="Freezer State"
                :values="visitationData.visitation?.freezer_state"
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_positioning"
                label="Freezer Positioning"
                :values="visitationData.visitation?.freezer_positioning"
              />
            </div>
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_gap_state"
                label="Freezer Gap State"
                :values="visitationData.visitation?.freezer_gap_state"
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_glass_state"
                label="Freezer Glass State"
                :values="visitationData.visitation?.freezer_glass_state"
              />
            </div>
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_thermometer_state"
                label="Freezer Thermometer State"
                :values="visitationData.visitation?.freezer_thermometer_state"
              />
            </div>
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_capacity_upper"
                label="Freezer Capacity Upper"
                :values="
                  visitationData.visitation?.freezer_capacity_upper + ' %'
                "
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="freezer_capacity_lower"
                label="Freezer Capacity Lower"
                :values="
                  visitationData.visitation?.freezer_capacity_lower + ' %'
                "
              />
            </div>
          </Fieldset>
          <Fieldset legend="Display">
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="is_price_board_displayed"
                label="Price Board Displayed"
                :values="
                  visitationData.visitation?.is_price_board_displayed
                    ? 'Yes'
                    : 'No'
                "
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="is_price_sticker_displayed"
                label="Price Sticker Displayed"
                :values="
                  visitationData.visitation?.is_price_sticker_displayed
                    ? 'Yes'
                    : 'No'
                "
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="is_banner_displayed"
                label="Banner Displayed"
                :values="
                  visitationData.visitation?.is_banner_displayed ? 'Yes' : 'No'
                "
              />
            </div>
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="is_poster_displayed"
                label="Poster Displayed"
                :values="
                  visitationData.visitation?.is_poster_displayed ? 'Yes' : 'No'
                "
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="is_flag_displayed"
                label="Flag Displayed"
                :values="
                  visitationData.visitation?.is_flag_displayed ? 'Yes' : 'No'
                "
              />
              <div class="w-full" />
            </div>
          </Fieldset>
          <Fieldset legend="Google Map">
            <div class="flex flex-row space-x-3">
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="latitude"
                label="Latitude"
                :values="visitationData.visitation?.latitude"
              />
              <FieldText
                readOnly
                className="flex flex-col flex-wrap gap-2 w-full mt-4"
                name="longitude"
                label="Longitude"
                :values="visitationData.visitation?.longitude"
              />
            </div>
            <div class="flex flex-row justify-end space-x-3">
              <Button
                label="Open in Maps"
                icon="pi pi-map-marker"
                @click="() => openMap(visitationData?.visitation)"
                class="mt-8"
                severity="primary"
              />
            </div>
          </Fieldset>
          <Fieldset legend="Visitation Image's">
            <Galleria
              :value="visitationData.visitation_images"
              :numVisible="7"
              :circular="true"
              :showItemNavigators="true"
              :showItemNavigatorsOnHover="true"
              containerClass="w-full"
            >
              <template #item="slotProps">
                <div class="relative flex justify-center">
                  <img
                    :src="slotProps.item.itemImageSrc"
                    class="max-h-[640px] object-contain"
                    style="width: auto; display: block"
                  />
                  <Chip
                    :label="slotProps.item.type"
                    class="absolute top-2 right-2"
                  />
                </div>
              </template>
              <template #thumbnail="slotProps">
                <div class="relative">
                  <img
                    :src="slotProps.item.itemImageSrc"
                    class="w-full h-[180px] object-cover"
                    style="display: block"
                  />
                  <Chip
                    :label="slotProps.item.type"
                    class="absolute top-1 right-1 text-xs"
                    style="transform: scale(0.95)"
                  />
                </div>
              </template>
            </Galleria>
          </Fieldset>
          <div
            class="flex flex-col items-end text-sm text-gray-500 mt-10 mb-1 space-y-1"
          >
            <div>
              Created:
              {{
                new Date(visitationData.visitation?.created_ts).toLocaleString()
              }}
            </div>
            <div>
              Last Updated:
              {{
                new Date(
                  visitationData.visitation?.last_updated_ts
                ).toLocaleString()
              }}
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <Button
              type="button"
              label="Back"
              severity="secondary"
              @click="onBack"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
