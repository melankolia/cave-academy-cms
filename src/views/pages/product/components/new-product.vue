<template>
  <Dialog
    v-model:visible="visibleCombined"
    modal
    header="Add Product"
    :style="{ width: '25rem' }"
  >
    <FieldText
      className="flex flex-col flex-wrap gap-2 w-full"
      name="productName"
      label="Product Name"
      :values="product.name"
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
        label="Submit"
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
  import ProductService from "@/service/ProductService";
  import * as zod from "zod";

  const props = defineProps({
    visible: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(["onCancel", "onSubmit", "update:visible"]);

  const validationSchema = toTypedSchema(
    zod.object({
      productName: zod
        .string({
          invalid_type_error: "Product Name is Required",
        })
        .min(1, { message: "Product Name is Required" }),
    })
  );

  const toast = useToast();

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema,
  });

  const productService = reactive(new ProductService());

  const product = reactive({
    name: null,
  });

  const onCancel = () => emit("onCancel");

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      product: values.productName,
    };

    try {
      const { status } = await productService.create(payload);

      if (status == 200) {
        emit("update:visible", false);
        return toast.add({
          severity: "success",
          summary: "Success",
          detail: "Product Added Successfully!",
          life: 3000,
        });
      }

      return toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to Add Product, please try again later!",
        life: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to Change Product, please try again later!",
        life: 3000,
      });
    }
  });

  const visibleCombined = computed({
    get: () => props.visible,
    set: (newValue) => emit("update:visible", newValue),
  });
</script>
