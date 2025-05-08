<script setup>
  import { VISITATION } from "@/router/constants";
  import VisitationService from "@/service/VisitationService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRouter } from "vue-router";
  import { format } from "date-fns";

  const router = useRouter();
  const visitationService = reactive(new VisitationService());
  const toast = useToast();
  const visitationData = ref([]);
  const loading = ref(false);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const options = ref({
    rowsPage: 5,
    currentPage: 1,
  });

  const totalRecords = ref(0);

  const selectedSales = ref(null);
  const selectedStore = ref(null);
  const dateRange = ref([new Date(), new Date()]);

  const salesSuggestions = ref([]);
  const storeSuggestions = ref([]);

  const searchSales = async (event) => {
    try {
      const {
        data: { data: user },
        status,
      } = await visitationService.searchSales();
      if (status == 200) {
        salesSuggestions.value = user.map((sales) => ({
          name: sales.full_name,
          id: sales.id,
        }));
      } else {
        throw new Error("Failed to fetch sales employees");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch sales employees",
        life: 3000,
      });
    }
  };

  const searchStores = async (event) => {
    try {
      const {
        data: { data: stores },
        status,
      } = await visitationService.searchStores();
      if (status == 200) {
        storeSuggestions.value = stores.map((store) => ({
          name: store.name,
          id: store.id,
        }));
      } else {
        throw new Error("Failed to fetch stores");
      }
    } catch (error) {
      console.log(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch stores",
        life: 3000,
      });
    }
  };

  const formatDate = (date) => (date ? format(date, "yyyy-MM-dd") : null);

  const getList = async () => {
    try {
      loading.value = true;
      const {
        data: {
          data: { visitations, stores },
          meta,
        },
        status,
      } = await visitationService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
        sales_id: selectedSales.value?.id,
        store_id: selectedStore.value?.id,
        start_date: formatDate(dateRange.value?.[0]),
        end_date: formatDate(dateRange.value?.[1]),
      });
      if (status == 200) {
        visitationData.value = [...visitations];
        totalRecords.value = meta.totalRows;
      } else {
        throw new Error("Failed to fetch data!");
      }
    } catch (error) {
      console.error(error);
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

  const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page + 1;
  };

  const getChipStyle = (item) => ({
    backgroundColor: item ? "#4caf50" : "#f53a5c",
    color: "white",
  });

  const getChipLabel = (item) => (item ? "Displayed" : "Not Displayed");

  const goDetail = (item) => {
    router.push({
      name: VISITATION.DETAIL,
      params: {
        id: item.id,
      },
    });
  };

  const goMap = (item) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${item?.latitude},${item?.longitude}`,
      "_blank"
    );
  };
  onMounted(() => {
    getList();
  });

  watch(
    () => options.value,
    (val) => {
      if (val !== null) getList();
    },
    { deep: true }
  );

  watch([selectedSales, selectedStore, dateRange], () => {
    getList();
  });

  const breadcrumbHome = ref({ icon: "pi pi-home", route: "/" });
  const breadcrumbItems = ref([{ label: "Visitation", route: "/visitation" }]);
</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6" style="padding-top: 4px; padding-bottom: 4px">
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

      <DataTable
        :loading="loading"
        :value="visitationData"
        dataKey="id"
        :filters="filters"
      >
        <template #header>
          <div class="grid grid-cols-12 gap-2 items-center">
            <h4 class="m-0 col-span-12 md:col-span-3">Visitation</h4>

            <div
              class="col-span-12 md:col-span-9 grid grid-cols-12 items-center gap-4"
            >
              <div class="col-span-12 md:col-span-3">
                <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText
                    v-model="filters['global'].value"
                    placeholder="Search..."
                    class="w-full"
                  />
                </IconField>
              </div>

              <div class="col-span-12 md:col-span-3">
                <AutoComplete
                  v-model="selectedSales"
                  :suggestions="salesSuggestions"
                  @complete="searchSales"
                  field="name"
                  optionLabel="name"
                  placeholder="Search Sales Employee"
                  class="w-full"
                  :virtualScrollerOptions="{ itemSize: 38 }"
                  dropdown
                />
              </div>

              <div class="col-span-12 md:col-span-3">
                <AutoComplete
                  v-model="selectedStore"
                  :suggestions="storeSuggestions"
                  @complete="searchStores"
                  field="name"
                  optionLabel="name"
                  placeholder="Search Store"
                  class="w-full"
                  :virtualScrollerOptions="{ itemSize: 38 }"
                  dropdown
                />
              </div>

              <div class="col-span-12 md:col-span-3">
                <Calendar
                  v-model="dateRange"
                  selectionMode="range"
                  :showIcon="true"
                  placeholder="Select Date Range"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </template>
        <template #empty> No Visitation found. </template>
        <template #loading> Loading Visitation data. Please wait. </template>

        <ColumnGroup type="header">
          <Row>
            <Column header="Id" :rowspan="2" />
            <Column header="Store" :rowspan="2" />
            <Column header="Item" :colspan="2" />
            <Column header="Variant Total" :rowspan="2" />
            <Column header="Freezer" :colspan="7" />
            <Column header="Display" :colspan="5" />
            <Column header="Google Map Link" :rowspan="2" />
          </Row>
          <Row>
            <Column header="Condition" field="goods_condition" />
            <Column header="Notes" field="goods_notes" />

            <Column header="State" field="freezer_state" />
            <Column header="Positioning" field="freezer_positioning" />
            <Column header="Gap" field="freezer_gap_state" />
            <Column header="Glass" field="freezer_glass_state" />
            <Column header="Thermometer" field="freezer_thermometer_state" />
            <Column header="Upper" field="freezer_capacity_upper" />
            <Column header="Lower" field="freezer_capacity_lower" />

            <Column header="Price Board" field="is_price_board_displayed" />
            <Column header="Price Sticker" field="is_price_sticker_displayed" />
            <Column header="Banner" field="is_banner_displayed" />
            <Column header="Poster" field="is_poster_displayed" />
            <Column header="Flag" field="is_flag_displayed" />
          </Row>
        </ColumnGroup>

        <Column header="Id" field="id" sortable style="min-width: 4rem">
          <template #body="slotProps">
            <Button
              class="m-0"
              style="padding-left: 0"
              :label="slotProps.data?.id?.toString() || ''"
              link
              @click="() => goDetail(slotProps.data)"
            />
          </template>
        </Column>

        <Column
          field="store.name"
          header="Store"
          sortable
          style="min-width: 12rem; text-align: left"
        />

        <Column
          field="goods_condition"
          header="Condition"
          sortable
          style="min-width: 9rem"
        />
        <Column
          field="goods_notes"
          header="Notes"
          sortable
          style="min-width: 9rem"
        >
          <template #body="slotProps">
            {{ slotProps.data?.goods_notes || "-" }}
          </template>
        </Column>

        <Column
          field="variant_count"
          header="Variant"
          sortable
          style="min-width: 9rem"
        />

        <Column
          field="freezer_state"
          header="State"
          sortable
          style="min-width: 6.5rem"
        >
        </Column>
        <Column
          field="freezer_positioning"
          header="Positioning"
          sortable
          style="min-width: 6.5rem"
        />
        <Column
          field="freezer_gap_state"
          header="Gap"
          sortable
          style="min-width: 6.5rem"
        />
        <Column
          field="freezer_glass_state"
          header="Glass"
          sortable
          style="min-width: 6.5rem"
        />
        <Column
          field="freezer_thermometer_state"
          header="Thermometer"
          sortable
          style="min-width: 6.5rem"
        />
        <Column
          field="freezer_capacity_upper"
          header="Upper"
          sortable
          style="min-width: 6.5rem"
        >
          <template #body="slotProps">
            {{ slotProps.data?.freezer_capacity_upper + " %" }}
          </template>
        </Column>
        <Column
          field="freezer_capacity_lower"
          header="Lower"
          sortable
          style="min-width: 6.5rem"
        >
          <template #body="slotProps">
            {{ slotProps.data?.freezer_capacity_lower + " %" }}
          </template>
        </Column>

        <Column
          field="is_price_board_displayed"
          header="Price Board"
          sortable
          style="min-width: 10rem"
        >
          <template #body="slotProps">
            <Chip
              :label="getChipLabel(slotProps.data?.is_price_board_displayed)"
              :style="getChipStyle(slotProps?.data?.is_price_board_displayed)"
            />
          </template>
        </Column>
        <Column
          field="is_price_sticker_displayed"
          header="Price Sticker"
          sortable
          style="min-width: 10rem"
        >
          <template #body="slotProps">
            <Chip
              :label="getChipLabel(slotProps.data?.is_price_sticker_displayed)"
              :style="getChipStyle(slotProps?.data?.is_price_sticker_displayed)"
            />
          </template>
        </Column>
        <Column
          field="is_banner_displayed"
          header="Banner"
          sortable
          style="min-width: 10rem"
        >
          <template #body="slotProps">
            <Chip
              :label="getChipLabel(slotProps.data?.is_banner_displayed)"
              :style="getChipStyle(slotProps?.data?.is_banner_displayed)"
            />
          </template>
        </Column>
        <Column
          field="is_poster_displayed"
          header="Poster"
          sortable
          style="min-width: 10rem"
        >
          <template #body="slotProps">
            <Chip
              :label="getChipLabel(slotProps.data?.is_poster_displayed)"
              :style="getChipStyle(slotProps?.data?.is_poster_displayed)"
            />
          </template>
        </Column>
        <Column
          field="is_flag_displayed"
          header="Flag"
          sortable
          style="min-width: 10rem"
        >
          <template #body="slotProps">
            <Chip
              :label="getChipLabel(slotProps.data?.is_flag_displayed)"
              :style="getChipStyle(slotProps?.data?.is_flag_displayed)"
            />
          </template>
        </Column>
        <Column
          field="latitude"
          header="Google Map Link"
          sortable
          style="min-width: 9rem"
        >
          <template #body="slotProps">
            <Button
              label="Map Link"
              link
              @click="() => goMap(slotProps.data)"
            />
          </template>
        </Column>

        <template #footer>
          <Paginator
            @page="handlePage"
            :rows="options.rowsPage"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[5, 10, 20]"
          ></Paginator>
        </template>
      </DataTable>
    </div>
  </div>
</template>
