<template>
  <Dialog
    v-model:visible="visibleCombined"
    modal
    header="Change Password"
    :style="{ width: '25rem' }"
  >
    <FieldPassword
      className="flex flex-col flex-wrap gap-2 w-full"
      name="newPassword"
      label="New Password"
      :values="credentials.newPassword"
    />
    <FieldPassword
      className="flex flex-col flex-wrap gap-2 w-full mt-4"
      name="confirmPassword"
      label="Confirm Password"
      :values="credentials.confirmPassword"
    />
    <div class="flex justify-end gap-2 mt-4">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="onCancel"
      />
      <Button
        type="button"
        label="Save"
        @click="onSubmit"
        :loading="isSubmitting"
      />
    </div>
  </Dialog>
</template>

<script setup>
  import { reactive, computed } from "vue";
  import { useForm } from "vee-validate";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import SalesManagementService from "@/service/SalesManagementService";
  import * as zod from "zod";

  const props = defineProps({
    secureId: {
      type: String,
      required: false,
      default: ":secureId",
    },
    visible: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(["onCancel", "onSubmit", "update:visible"]);

  const validationSchema = toTypedSchema(
    zod
      .object({
        newPassword: zod
          .string({
            invalid_type_error: "Password is Required",
          })
          .min(1, { message: "Password is Required" }),
        confirmPassword: zod
          .string({
            invalid_type_error: "Confirm Password is Required",
          })
          .min(1, { message: "Confirm Password is Required" }),
      })
      .refine((val) => val.newPassword == val.confirmPassword, {
        message: "Password does not match!",
        path: ["confirmPassword"],
      })
  );

  const toast = useToast();

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema,
  });

  const salesManagementService = reactive(new SalesManagementService());

  const credentials = reactive({
    newPassword: null,
    confirmPassword: null,
  });

  const onCancel = () => emit("onCancel");

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      newPassword: values.newPassword,
    };

    const secureId = props.secureId;

    try {
      const { status } = await salesManagementService.updatePassword(
        payload,
        secureId
      );

      if (status == 200) {
        emit("update:visible", false);
        return toast.add({
          severity: "success",
          summary: "Success",
          detail: "Password Changed Successfully!",
          life: 3000,
        });
      }

      return toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to Change Password, please try again later!",
        life: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to Change Password, please try again later!",
        life: 3000,
      });
    }
  });

  const visibleCombined = computed({
    get: () => props.visible,
    set: (newValue) => emit("update:visible", newValue),
  });
</script>
