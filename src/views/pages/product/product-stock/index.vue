<script setup>
  import { PRODUCT } from "@/router/constants";
  import ProductStockService from "@/service/ProductStockService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const productStockService = reactive(new ProductStockService());
  const toast = useToast();
  const productData = ref([]);
  const loading = ref(false);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const options = ref({
    rowsPage: 5,
    currentPage: 0,
  });

  const totalRecords = ref(0);

  const visible = ref(false);

  const getList = async () => {
    try {
      loading.value = true;
      const {
        data: { data, meta, message },
      } = await productStockService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
      });
      if (message == "OK") {
        productData.value = [...data];
        totalRecords.value = meta.totalElements;
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

  const openNew = () => {
    visible.value = true;
  };

  const editProduct = (item) => {
    router.push({
      name: PRODUCT.UPDATE,
      params: {
        secureId: item.secureId,
      },
    });
  };

  const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page;
  };

  const handleAddProduct = () => {};

  const convertDate = (date) =>
    (date &&
      new Date(date).toLocaleString("id-ID", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })) ||
    "-";

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
</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button
            label="New"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            @click="openNew"
          />
        </template>
      </Toolbar>

      <DataTable
        :loading="loading"
        :value="productData"
        dataKey="secureId"
        :filters="filters"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Product Stock</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Search..."
              />
            </IconField>
          </div>
        </template>
        <template #empty> No Product found. </template>
        <template #loading> Loading Product data. Please wait. </template>

        <Column
          field="productName"
          header="Product"
          sortable
          style="min-width: 16rem"
        >
          <template #body="slotProps">
            <Button class="m-0" :label="slotProps.data?.productName" link />
          </template>
        </Column>

        <Column
          field="distributorName"
          header="Distributor"
          sortable
          style="min-width: 16rem"
        />

        <Column
          field="areaName"
          header="Area"
          sortable
          style="min-width: 16rem"
        />

        <Column
          field="qty"
          header="Quantity"
          sortable
          style="min-width: 16rem"
        />

        <Column
          field="price"
          header="Price"
          sortable
          style="min-width: 16rem"
        />

        <Column
          field="createdTs"
          header="Created Date"
          sortable
          style="min-width: 16rem"
        >
          <template #body="slotProps">
            <span class="p-column-title">
              {{ convertDate(slotProps.data?.createdTs) }}</span
            >
          </template>
        </Column>

        <Column
          field="lastUpdatedTs"
          header="Updated Date"
          sortable
          style="min-width: 16rem"
        >
          <template #body="slotProps">
            <span class="p-column-title">
              {{ convertDate(slotProps.data?.lastUpdatedTs) }}
            </span>
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
