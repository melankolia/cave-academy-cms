<script setup>
  import DashboardService from "@/service/DashboardService";

  import { COURSE } from "@/router/constants";
  import { useAuthStore } from "@/store/auth";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRouter } from "vue-router";

  const toast = useToast();
  const router = useRouter();
  const store = useAuthStore();

  // Active Students Count Per Course Section
  const dashboardService = reactive(new DashboardService());
  const activeStudents = ref(0);
  const activeStudentsList = ref([]);
  const loadingActiveStudents = ref(false);
  const options = ref({
    rowsPage: 5,
    currentPage: 0,
  });
  const totalRecords = ref(0);

  const getActiveStudentsCountPerCourse = async () => {
    try {
      loadingActiveStudents.value = true;
      const {
        data: { data, status },
      } = await dashboardService.activeStudentsCountPerCourse();

      if (status == "success") {
        activeStudentsList.value = [...data.activeStudents];
        activeStudents.value = data.activeStudentCount;
      } else {
        throw new Error("Failed to fetch data!");
      }
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch news data!",
        life: 3000,
      });
    } finally {
      loadingActiveStudents.value = false;
    }
  };

  const handleActiveStudentsDetail = (item) => {
    router.push({
      name: COURSE.DETAIL,
      params: {
        secureId: item.secureId,
      },
    });
  };

  const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page;
  };

  onMounted(() => {
    getActiveStudentsCountPerCourse();
  });
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4"
              >Username</span
            >
            <div
              class="text-surface-900 dark:text-surface-0 font-medium text-xl"
            >
              {{ store.username }}
            </div>
          </div>
          <div
            class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-key text-blue-500 !text-xl"></i>
          </div>
        </div>
        <span class="text-muted-color">You're login as </span>
        <span class="text-primary font-medium"> {{ store.username }}</span>
      </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">Role</span>
            <div
              class="text-surface-900 dark:text-surface-0 font-medium text-xl"
            >
              {{ store.role }}
            </div>
          </div>
          <div
            class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-shield text-orange-500 !text-xl"></i>
          </div>
        </div>
        <span class="text-muted-color">Your role is </span>
        <span class="text-primary font-medium">{{ store.role }}</span>
      </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4"
              >Active Students</span
            >
            <Skeleton
              v-if="loadingActiveStudents"
              width="3rem"
              height="2.2rem"
            ></Skeleton>
            <div
              v-else
              class="text-surface-900 dark:text-surface-0 font-medium text-xl"
            >
              {{ activeStudents || 0 }}
            </div>
          </div>
          <div
            class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-users text-purple-500 !text-xl"></i>
          </div>
        </div>
        <span class="text-muted-color">Total Active Students</span>
      </div>
    </div>

    <div class="col-span-12 xl:col-span-9">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Recent Course</div>
        <DataTable
          :loading="loadingActiveStudents"
          :value="activeStudentsList"
          :rows="5"
          responsiveLayout="scroll"
        >
          <template #empty> No Active Students found. </template>
          <template #loading>
            Loading Active Students data. Please wait.
          </template>
          <Column
            field="courseTitle"
            header="Course Title"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              <Button
                :label="slotProps.data?.courseTitle"
                link
                @click="() => handleActiveStudentsDetail(slotProps.data)"
              />
            </template>
          </Column>
          <Column
            field="activeStudentCount"
            header="Active Student Count"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              {{ slotProps.data?.activeStudentCount }}
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
  </div>
</template>
