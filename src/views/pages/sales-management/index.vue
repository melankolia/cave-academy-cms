<script setup>
  import SalesManagementService from "@/service/SalesManagementService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import ChangePassword from "./components/change-password.vue";

  const salesManagementService = reactive(new SalesManagementService());
  const toast = useToast();
  const salesManagementData = ref();
  const selectedItem = ref({
    secureId: null,
  });
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
      } = await salesManagementService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
      });
      if (message == "OK") {
        data.map((e, id) => {
          e.id = id;
        });
        salesManagementData.value = [...data];
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

  const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page;
  };

  const editPassword = (item) => {
    selectedItem.value = { ...item };
    visible.value = true;
  };

  const handleChangePassword = () => {};

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
          />
        </template>
      </Toolbar>

      <DataTable
        :loading="loading"
        :value="salesManagementData"
        dataKey="secureId"
        :filters="filters"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Sales</h4>
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
        <template #empty> No Sales found. </template>
        <template #loading> Loading Sales data. Please wait. </template>
        <Column
          field="fullName"
          header="Name"
          sortable
          style="min-width: 16rem"
        />
        <Column
          field="username"
          header="Username"
          sortable
          style="min-width: 16rem"
        />
        <Column
          field="email"
          header="Email"
          sortable
          style="min-width: 16rem"
        />
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editPassword(slotProps.data)"
            />
          </template>
        </Column>

        <template #footer>
          <Paginator
            @page="handlePage"
            :rows="options.rowsPage"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[5, 10, 20]"
          />
        </template>
      </DataTable>
    </div>

    <ChangePassword
      :secureId="selectedItem?.secureId"
      :visible="visible"
      @onCancel="visible = false"
      @onSubmit="handleChangePassword"
      @update:visible="visible = $event"
    />
  </div>
</template>
