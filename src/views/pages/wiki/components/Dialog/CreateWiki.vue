<template>
  <Dialog
    v-model:visible="visibleCombined"
    modal
    :header="isEdit ? 'Edit Wiki' : 'Create Wiki'"
    :style="{ minWidth: '55%', maxWidth: '90%' }"
    :closable="false"
  >
    <div class="card surface-ground py-5 mt-4">
      <Fieldset legend="Wiki Information" :toggleable="true">
        <div class="flex flex-col gap-4 w-full">
          <FieldText
            className="flex flex-col flex-wrap gap-2 w-full"
            name="title"
            label="Title"
            :values="values.title"
          />
          <FieldTextArea
            className="flex flex-col flex-wrap gap-2 w-full"
            name="description"
            label="Description"
            :values="values.description"
            rows="4"
          />
          <FieldText
            className="flex flex-col flex-wrap gap-2 w-full"
            name="imageUrl"
            label="Image URL"
            :values="values.imageUrl"
          />
          <FieldText
            className="flex flex-col flex-wrap gap-2 w-full"
            name="thumbnailUrl"
            label="Thumbnail URL"
            :values="values.thumbnailUrl"
          />
        </div>
      </Fieldset>

      <Fieldset legend="Content Creation" :toggleable="true">
        <div id="editorjs" class="editor-wrapper"></div>
        <small v-if="meta.touched && !meta.valid" class="text-red-500">
          {{ contentError }}
        </small>
      </Fieldset>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          text
          icon="pi pi-times"
          type="button"
          label="Cancel"
          severity="danger"
          class="w-[130px]"
          @click="onCancel"
        />
        <Button
          type="button"
          icon="pi pi-check"
          label="Save"
          class="w-[130px]"
          @click="onSubmit"
          :loading="isSubmitting"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
  import { useField, useForm } from "vee-validate";
  import { ref, computed, watch } from "vue";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import * as zod from "zod";

  const props = defineProps({
    visible: {
      type: Boolean,
      required: true,
    },
    selected: {
      type: Object,
      required: false,
    },
  });

  // Editor.js and plugins
  import EditorJS from "@editorjs/editorjs";
  import Header from "@editorjs/header";
  import List from "@editorjs/list";
  import SimpleImage from "@editorjs/simple-image";
  import Paragraph from "@editorjs/paragraph";
  import ImageTool from "@editorjs/image";
  import CodeTool from "@editorjs/code";
  import Underline from "@editorjs/underline";
  import LinkTool from "@editorjs/link";
  import RawTool from "@editorjs/raw";
  import Embed from "@editorjs/embed";
  import Quote from "@editorjs/quote";

  const emit = defineEmits(["onCancel", "onSubmit", "update:visible"]);

  const toast = useToast();

  const isEdit = computed(() => {
    return !!props.selected;
  });

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
      thumbnailUrl: zod
        .string()
        .min(1, { message: "Thumbnail is Required" })
        .url({ message: "Must be a valid URL" }),
      imageUrl: zod
        .string()
        .min(1, { message: "Image is Required" })
        .url({ message: "Must be a valid URL" }),
      content: zod
        .string({
          required_error: "Content is Required",
          invalid_type_error: "Content must be a string",
        })
        .min(1, { message: "Content cannot be empty" })
        .refine(
          (val) => {
            if (!val) return false;
            try {
              const parsed = JSON.parse(val);
              return (
                parsed &&
                parsed.blocks &&
                Array.isArray(parsed.blocks) &&
                parsed.blocks.length > 0
              );
            } catch (error) {
              console.error("Error in content validation:", error);
              return false;
            }
          },
          { message: "Please add some content to the editor" }
        ),
    })
  );

  const {
    handleSubmit,
    errors,
    isSubmitting,
    resetForm,
    meta,
    values,
    setValues,
  } = useForm({
    validationSchema,
    initialValues: {
      title: isEdit.value ? props.selected.title : "",
      description: isEdit.value ? props.selected.description : "",
      thumbnailUrl: isEdit.value ? props.selected.thumbnailUrl : "",
      imageUrl: isEdit.value ? props.selected.imageUrl : "",
      content: isEdit.value ? props.selected.content : "",
    },
  });

  const {
    value: content,
    errorMessage: contentError,
    setValue: setValueContent,
    meta: contentMeta,
    setTouched: setContentTouched,
    resetField: resetContent,
  } = useField("content");

  const editorInstance = ref(null);

  // Editor Setup
  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      placeholder: "Let's write an awesome story!",
      readOnly: false,
      autofocus: true,
      tools: {
        header: Header,
        list: List,
        image: SimpleImage,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: "http://localhost:8008/uploadFile",
              byUrl: "http://localhost:8008/fetchUrl",
            },
          },
        },
        code: CodeTool,
        underline: Underline,
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: "http://localhost:8008/fetchUrl",
          },
        },
        raw: RawTool,
        embed: Embed,
        quote: Quote,
      },
      data: content.value ? JSON.parse(content.value) : {},
      onChange: async () => {
        try {
          const outputData = await editorInstance.value.save();
          const jsonString = JSON.stringify(outputData);
          await setValueContent(jsonString);
          await setContentTouched(true);
        } catch (error) {
          console.error("Error in onChange:", error);
        }
      },
    });
  };

  const visibleCombined = computed({
    get: () => props.visible,
    set: (newValue) => emit("update:visible", newValue),
  });

  const onCancel = () => {
    resetForm();
    emit("onCancel", false);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        thumbnailUrl: values.thumbnailUrl,
        imageUrl: values.imageUrl,
        content: values.content,
      };

      emit("onSubmit", payload);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to fetch data!",
        life: 3000,
      });
    }
  });

  watch(visibleCombined, (newVal) => {
    if (newVal) {
      initEditor();
      if (isEdit.value) {
        setValues({
          title: props.selected.title,
          description: props.selected.description,
          thumbnailUrl: props.selected.thumbnailUrl,
          imageUrl: props.selected.imageUrl,
          content: props.selected.content,
        });
      }
    } else {
      editorInstance.value.destroy();
    }
  });
</script>

<style scoped>
  .editor-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .editor-wrapper {
    width: 100%;
    min-height: 300px;
    border-radius: 0.375rem;
    padding: 1rem;
  }

  /* Make the editor responsive */
  @media (max-width: 768px) {
    .editor-wrapper {
      padding: 0.5rem;
    }
  }
</style>
