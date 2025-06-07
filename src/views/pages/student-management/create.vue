<template>
  <div class="card">
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
      <div class="font-semibold text-2xl mb-8">
        {{ isUpdate ? "Update" : "Create" }} Student
      </div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="name"
          label="Name"
          :values="values.name"
        />
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="email"
          label="Email"
          type="email"
          :values="values.email"
        />

        <FieldPassword
          className="flex flex-col flex-wrap gap-2 w-full"
          name="password"
          label="Password"
          :values="values.password"
          :disabled="isUpdate"
        />
        <FieldPassword
          className="flex flex-col flex-wrap gap-2 w-full"
          name="confirmPassword"
          label="Confirm Password"
          :values="values.confirmPassword"
          :disabled="isUpdate"
        />
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
            label="Save Student"
            icon="pi pi-check"
            severity="primary"
            class="w-[130px]"
            @click="saveData"
            :loading="loadingSubmit"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
  import FieldPassword from "@/components/Input/FieldPassword.vue";
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { DASHBOARD, STUDENT_MANAGEMENT } from "@/router/constants";
  import StudentService from "@/service/StudentService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import { computed, onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";

  const studentData = ref({
    name: "",
    email: "",
  });

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const studentService = reactive(new StudentService());
  const loadingSubmit = ref(false);
  const loading = ref(false);

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

  const { handleSubmit, errors, values, setValues } = useForm({
    validationSchema,
    initialValues: {
      name: studentData.value.name,
      email: studentData.value.email,
      password: "",
      confirmPassword: "",
    },
  });

  const breadcrumbHome = ref({ icon: "pi pi-home", route: DASHBOARD.LIST });

  const breadcrumbItems = ref([
    { label: "Student List", route: STUDENT_MANAGEMENT.LIST },
    { label: "Student " + (isUpdate.value ? "Update" : "Create") },
  ]);

  onMounted(async () => {
    if (isUpdate.value) await getDetail();
  });

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

  const onCancel = () => {
    router.replace({
      name: STUDENT_MANAGEMENT.LIST,
    });
  };

  const saveData = handleSubmit(async (values) => {
    try {
      loadingSubmit.value = true;

      const payload = {
        name: values?.name,
        email: values?.email,
        password: values?.password,
      };

      let type = "create";
      if (isUpdate.value) type = "update";

      const secureId = route.params?.secureId;

      const {
        data: { data, status, message },
      } = await studentService[type](payload, secureId);

      if (status === "success") {
        router.replace({
          name: STUDENT_MANAGEMENT.DETAIL,
          params: { secureId: data.id },
        });
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: `Student ${isUpdate.value ? "Updated" : "Created"}`,
          life: 3000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: "Failed",
          detail: data.message,
          life: 3000,
        });
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Failed to Create Student",
        detail: error.message,
        life: 3000,
      });
    } finally {
      loadingSubmit.value = false;
    }
  });
</script>

<style scoped>
  .card {
    padding: 24px;
  }
</style>
