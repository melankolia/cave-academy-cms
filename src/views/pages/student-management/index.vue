<script setup>
  import StudentService from "@/service/StudentService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { STUDENT_MANAGEMENT } from "@/router/constants";
  import { useRouter } from "vue-router";

  const studentService = reactive(new StudentService());
  const toast = useToast();
  const studentData = ref();
  const router = useRouter();

  const loading = ref(false);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const options = ref({
    rowsPage: 5,
    currentPage: 0,
  });
  const totalRecords = ref(0);

  const getList = async () => {
    try {
      loading.value = true;
      const { data } = await studentService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
      });
      if (data.status === "success") {
        studentData.value = data.data;
        totalRecords.value = data.data.length;
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

  const handleDetail = (data) => {
    router.push({
      name: STUDENT_MANAGEMENT.DETAIL,
      params: { secureId: data.id },
    });
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

  const onEdit = (data) => {
    router.push({
      name: STUDENT_MANAGEMENT.UPDATE,
      params: { secureId: data.id },
    });
  };

  const onDelete = (data) => {
    confirm.require({
      message: `Are you sure you want to delete ${data.name}?`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Delete",
        severity: "danger",
      },
      accept: () => {
        deleteStudent();
      },
    });
  };

  const deleteStudent = async () => {
    try {
      const { data } = await studentService.delete(data.secureId);

      if (data.status === "success") {
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Student Deleted",
          life: 3000,
        });
      } else {
        throw new Error("Failed to delete data!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to delete data!",
        life: 3000,
      });
    }
  };

  const onAdd = () => {
    router.push({
      name: STUDENT_MANAGEMENT.CREATE,
    });
  };
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
            @click="onAdd"
          />
        </template>
      </Toolbar>

      <DataTable
        :loading="loading"
        :value="studentData"
        dataKey="secureId"
        :filters="filters"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Student</h4>
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
        <template #empty> No Student found. </template>
        <template #loading> Loading Student data. Please wait. </template>
        <Column field="name" header="Name" sortable style="min-width: 16rem">
          <template #body="slotProps">
            <Button
              :label="slotProps.data?.name"
              link
              @click="() => handleDetail(slotProps.data)"
            />
          </template>
        </Column>
        <Column
          field="email"
          header="Email"
          sortable
          style="min-width: 16rem"
        />
        <Column header="Action" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="onEdit(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="onDelete(slotProps.data)"
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
  </div>
</template>
