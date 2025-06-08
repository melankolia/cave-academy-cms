<template>
  <div class="card">
    <ConfirmDialog />

    <Toolbar>
      <template #start>
        <Breadcrumb
          style="padding: 4px"
          :home="breadcrumbHome"
          :model="breadcrumbItems"
        >
          <template #item="{ item, props }">
            <router-link
              v-if="item.route"
              v-slot="{ href, navigate }"
              :to="{ name: item.route }"
              custom
            >
              <a :href="href" v-bind="props.action" @click="navigate">
                <span :class="[item.icon, 'text-color']" />
                <span class="text-primary font-semibold">{{ item.label }}</span>
              </a>
            </router-link>
            <a
              v-else
              :href="item.url"
              :target="item.target"
              v-bind="props.action"
            >
              <span class="text-surface-700 dark:text-surface-0">{{
                item.label
              }}</span>
            </a>
          </template>
        </Breadcrumb>
      </template>
    </Toolbar>
  </div>

  <div v-if="loading">
    <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
    <SkeletonCard />
  </div>
  <template v-else>
    <div class="card mb-2">
      <div class="font-semibold text-2xl mb-8">Student Detail</div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="name"
          label="Name"
          readOnly
        />
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="email"
          label="Email"
          type="email"
          readOnly
        />
      </div>
    </div>

    <div class="card mb-2">
      <div class="font-semibold text-2xl mb-8">Purchase History</div>
      <div class="flex flex-col gap-4 w-full">
        <DataTable
          :value="values.purchaseHistories"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <template #empty> No Purchase History found. </template>
          <template #loading>
            Loading Purchase History data. Please wait.
          </template>
          <Column field="id" header="No" sortable style="min-width: 2rem" />
          <Column
            field="course.title"
            header="Course"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              <Button
                :label="slotProps.data?.course?.title"
                link
                @click="() => handleDetail(slotProps.data)"
              />
            </template>
          </Column>
          <Column
            field="course.description"
            header="Description"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              <span class="line-clamp-2">{{
                slotProps.data?.course?.description
              }}</span>
            </template>
          </Column>
          <Column
            field="course.level"
            header="Level"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              <Chip :label="slotProps.data?.course?.level" class="capitalize" />
            </template>
          </Column>
          <Column
            field="course.type"
            header="Type"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              <Tag
                :value="slotProps.data?.course?.type"
                :severity="
                  slotProps.data?.course?.type === 'online'
                    ? 'success'
                    : 'danger'
                "
                class="capitalize"
              />
            </template>
          </Column>
          <Column
            field="createdAt"
            header="Created At"
            sortable
            style="min-width: 16rem"
          >
            <template #body="slotProps">
              {{ formatDate(slotProps.data?.createdAt) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div class="card surface-ground py-5 mt-4">
      <div class="flex justify-end px-4">
        <div class="flex gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            class="w-[130px]"
            outlined
            @click="onCancel"
          />
          <Button
            label="Edit Student"
            icon="pi pi-pencil"
            severity="primary"
            class="dark:text-white"
            @click="onEdit"
          />
          <Button
            :loading="loadingDelete"
            label="Delete Student"
            icon="pi pi-trash"
            severity="danger"
            class="dark:text-white"
            @click="onDelete"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { COURSE, DASHBOARD, STUDENT_MANAGEMENT } from "@/router/constants";
  import StudentService from "@/service/StudentService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useForm } from "vee-validate";
  import { computed, onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useConfirm } from "primevue/useconfirm";
  import * as zod from "zod";

  const studentData = ref({
    name: "",
    email: "",
  });

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const studentService = reactive(new StudentService());
  const loading = ref(false);
  const confirm = useConfirm();

  const isUpdate = computed(() => {
    return route.params?.secureId;
  });

  const validationSchema = toTypedSchema(
    zod.object({
      name: zod.string().min(1, { message: "Name is Required" }),
      email: zod
        .string()
        .min(1, { message: "Email is Required" })
        .email({ message: "Invalid email format" }),
      password: isUpdate.value
        ? zod.string().min(6, { message: "Password is Required" }).optional()
        : zod.string().min(6, { message: "Password is Required" }),
      confirmPassword: isUpdate.value
        ? zod
            .string()
            .min(6, { message: "Confirm Password is Required" })
            .optional()
            .refine((val) => !val || val === values.password, {
              message: "Passwords don't match",
            })
        : zod
            .string()
            .min(6, { message: "Confirm Password is Required" })
            .refine((val) => val === values.password, {
              message: "Passwords don't match",
            }),
    })
  );

  const { values, setValues } = useForm({
    validationSchema,
    initialValues: {
      name: studentData.value.name,
      email: studentData.value.email,
      password: "",
      confirmPassword: "",
      purchaseHistory: [],
    },
  });

  const breadcrumbHome = ref({ icon: "pi pi-home", route: DASHBOARD.LIST });

  const breadcrumbItems = ref([
    { label: "Student List", route: STUDENT_MANAGEMENT.LIST },
    { label: "Student Detail" },
  ]);

  onMounted(() => {
    getDetail();
  });

  const handleDetail = (data) => {
    router.push({
      name: COURSE.DETAIL,
      params: { secureId: data?.course?.id },
    });
  };

  const getDetail = async () => {
    try {
      loading.value = true;
      const secureId = route.params?.secureId;

      const { data } = await studentService.details(secureId);
      if (data.status === "success") {
        const result = data.data;

        setValues(result);
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
      router.back();
    } finally {
      loading.value = false;
    }
  };

  const onEdit = () => {
    router.push({
      name: STUDENT_MANAGEMENT.UPDATE,
      params: { secureId: route.params.secureId },
    });
  };

  const onCancel = () => {
    router.replace({
      name: STUDENT_MANAGEMENT.LIST,
    });
  };

  const loadingDelete = ref(false);
  const onDelete = () => {
    confirm.require({
      message: `Are you sure you want to delete ${values.name}?`,
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

  async function deleteStudent() {
    try {
      loadingDelete.value = true;
      const { data } = await studentService.delete(route.params?.secureId);

      if (data.status === "success") {
        router.replace({
          name: STUDENT_MANAGEMENT.LIST,
        });

        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Student Deleted",
          life: 3000,
        });
      } else {
        console.error(data);
        throw new Error("Failed to Delete Student!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to Delete News!",
        life: 3000,
      });
    } finally {
      loadingDelete.value = false;
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
</script>

<style scoped>
  .card {
    padding: 24px;
  }
</style>
