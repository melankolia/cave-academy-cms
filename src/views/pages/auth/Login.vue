<script setup>
  import { toTypedSchema } from "@vee-validate/zod";
  import { useField, useForm } from "vee-validate";
  import * as zod from "zod";

  import FloatingConfigurator from "@/components/FloatingConfigurator.vue";
  import { useAuthStore } from "@/store/auth";
  import { useToast } from "primevue/usetoast";
  import { ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();

  const validationSchema = toTypedSchema(
    zod.object({
      username: zod.string().min(1, { message: "Username is Required" }),
      password: zod.string().min(1, { message: "Password is Required" }),
    })
  );

  const { handleSubmit, errors, meta } = useForm({
    validationSchema,
  });
  const { value: username } = useField("username");
  const { value: password } = useField("password");

  const checked = ref(false);
  const loading = ref(false);

  const store = useAuthStore();

  const handleEnterKey = (e) => {
    if (e.keyCode === 13) handleLogin();
  };
  const handleLogin = handleSubmit(async (values) => {
    try {
      loading.value = true;

      const payload = {
        username: values.username,
        password: values.password,
        source: "web",
      };

      const {
        status,
        data: { data },
      } = await store.login(payload);

      if (status == 200) {
        store.$patch({
          token: data.token,
          userId: data?.user_id,
          role: data?.user_role,
          name: data?.name,
          username: data?.username,
        });

        if (route?.query?.redirect) {
          router.replace(route.query.redirect);
          return;
        }

        router.replace("/");
      } else {
        throw new Error("Failed to login!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to login!",
        life: 3000,
      });
      console.error(error);
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <Toast />
  <FloatingConfigurator />
  <div
    class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
  >
    <div class="flex flex-col items-center justify-center">
      <div class="drop-shadow-2xl" style="border-radius: 56px; padding: 0.3rem">
        <div
          class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
          style="border-radius: 53px"
        >
          <div class="text-center mb-8">
            <img
              class="mb-2 w-32 shrink-0 mx-auto"
              src="@/assets/cms-logo.png"
              alt="Content Management System logo"
            />
            <div
              class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4"
            >
              Content Management System
            </div>
            <span class="text-muted-color font-medium"
              >Sign in to continue</span
            >
          </div>

          <div>
            <div v-auto-animate class="flex flex-col mb-8">
              <label
                for="username"
                class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
                >Username</label
              >
              <InputText
                :class="{ 'p-invalid': errors.username }"
                id="username"
                type="text"
                placeholder="Username"
                class="w-full md:w-[30rem] mb-0.5"
                v-model="username"
              />
              <small v-if="errors.username" class="text-red-500">{{
                errors.username
              }}</small>
            </div>

            <div v-auto-animate class="flex flex-col mb-4">
              <label
                for="password"
                class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2"
                >Password</label
              >
              <Password
                :class="{ 'p-invalid': errors.password }"
                class="mb-0.5"
                @keyup="handleEnterKey"
                id="password"
                type="password"
                v-model="password"
                placeholder="Password"
                :toggleMask="true"
                fluid
                :feedback="false"
              ></Password>
              <small v-if="errors.password" class="text-red-500">{{
                errors.password
              }}</small>
            </div>

            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
              <div class="flex items-center">
                <Checkbox
                  v-model="checked"
                  id="rememberme1"
                  binary
                  class="mr-2"
                ></Checkbox>
                <label for="rememberme1">Remember me</label>
              </div>
            </div>
            <Button
              :disabled="!meta.valid"
              @click="handleLogin"
              :loading="loading"
              label="Sign In"
              class="w-full"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
  }

  .pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
  }
</style>
