<script setup>
  import { COURSE } from "@/router/constants";
  import CourseService from "@/service/CourseService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const courseService = reactive(new CourseService());
  const toast = useToast();
  const courseData = ref();
  const deleteCourseDialog = ref(false);
  const course = ref({});
  const loading = ref(false);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const options = ref({
    rowsPage: 5,
    currentPage: 0,
  });

  const totalRecords = ref(0);
  onMounted(() => {
    getList();
  });

  const getList = async () => {
    try {
      loading.value = true;
      const {
        data: {
          result: { listData, totalElements },
          message,
        },
      } = await courseService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
      });
      if (message == "OK") {
        listData.map((e, id) => {
          e.id = id;
        });
        courseData.value = [...listData];
        totalRecords.value = totalElements;
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
    router.push({
      name: COURSE.CREATE,
    });
  };

  function confirmDeleteCourse(course) {
    course.value = course;
    deleteCourseDialog.value = true;
  }

  const editCourse = (item) => {
    router.push({
      name: COURSE.UPDATE,
      params: {
        secureId: item.secureId,
      },
    });
  };

  const handleDetail = (item) => {
    router.push({
      name: COURSE.DETAIL,
      params: {
        secureId: item.secureId,
      },
    });
  };

  const loadingDelete = ref(false);
  async function deleteCourse() {
    try {
      loadingDelete.value = true;
      const {
        data: { result, message },
      } = await courseService.delete(course.value?.secureId);

      if (message == "OK") {
        courseData.value = [
          ...courseData.value.filter(
            (val) => val.secureId !== course.value?.secureId
          ),
        ];
        course.value = {};
        deleteCourseDialog.value = false;
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Course Deleted",
          life: 3000,
        });
      } else {
        console.error(result);
        throw new Error("Failed to Delete Course!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to Delete Course!",
        life: 3000,
      });
    } finally {
      loadingDelete.value = false;
    }
  }

  const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page;
  };

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
        :value="courseData"
        dataKey="secureId"
        :filters="filters"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Course</h4>
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
        <template #empty> No Course found. </template>
        <template #loading> Loading Course data. Please wait. </template>

        <Column field="title" header="Title" sortable style="min-width: 16rem">
          <template #body="slotProps">
            <Button
              :label="slotProps.data?.title"
              link
              @click="() => handleDetail(slotProps.data)"
            />
          </template>
        </Column>
        <Column header="Photo">
          <template #body="slotProps">
            <img
              :src="
                slotProps.data?.photoVos[slotProps.data?.photoVos.length - 1]
                  ?.photo || '/images/placeholder-image.png'
              "
              alt="sample content"
              class="rounded"
              style="width: 128px"
            />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editCourse(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteCourse(slotProps.data)"
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

    <Dialog
      v-model:visible="deleteCourseDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="course">
          Are you sure you want to delete <b>{{ course.title }} </b>?
        </span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteCourseDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="deleteCourse"
          :loading="loadingDelete"
        />
      </template>
    </Dialog>
  </div>
</template>
