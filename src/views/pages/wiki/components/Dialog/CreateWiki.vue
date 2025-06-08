<template>
  <Dialog
    v-model:visible="visibleCombined"
    modal
    header="Wiki Detail"
    :style="{ width: '960px' }"
    :closable="false"
    maximizable
    :draggable="false"
  >
    <div class="card surface-ground py-5 mt-4">
      <Fieldset legend="Wiki Information" :toggleable="true">
        <div class="flex flex-col gap-4 w-full">
          <FieldText
            className="flex flex-col flex-wrap gap-2 w-full"
            name="title"
            label="Title"
            :values="values.title"
            :readOnly="isDetail"
          />
          <FieldTextArea
            className="flex flex-col flex-wrap gap-2 w-full"
            name="description"
            label="Description"
            :values="values.description"
            rows="4"
            :readOnly="isDetail"
          />
          <template v-if="isDetail">
            <div class="flex flex-col gap-2">
              <div class="mb-2">Image</div>
              <img
                :src="values.imageUrl"
                :alt="values.title"
                class="rounded"
                style="width: 100%"
              />
            </div>
            <div class="flex flex-col gap-2">
              <div class="mb-2">Thumbnail</div>
              <img
                :src="values.thumbnailUrl"
                :alt="values.title"
                class="rounded"
                style="width: 100%"
              />
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col">
              <div class="mb-2">Image</div>
              <UploadImage
                :multiple="false"
                :uploadFn="onUploadImage"
                @cancelImage="onCancelImage"
              />
              <small v-if="!metaImage.valid" class="text-red-500">{{
                imageUrlError
              }}</small>
            </div>
            <div v-if="imageUrl" class="flex flex-col">
              <div class="mb-2">Image Preview</div>
              <img :src="imageUrl" alt="Image Preview" class="w-full" />
            </div>

            <div class="flex flex-col">
              <div class="mb-2">Thumbnail</div>
              <UploadImage
                :multiple="false"
                :uploadFn="onUploadThumbnail"
                @cancelImage="onCancelThumbnail"
              />
              <small v-if="!metaThumbnail.valid" class="text-red-500">{{
                thumbnailUrlError
              }}</small>
            </div>
            <div v-if="thumbnailUrl" class="flex flex-col">
              <div class="mb-2">Thumbnail Preview</div>
              <img :src="thumbnailUrl" alt="Thumbnail Preview" class="w-full" />
            </div>
          </template>
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
          v-if="!isDetail"
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
  import { WIKI } from "@/router/constants";
  import { LINK_PREVIEW } from "@/service/Instance/constants";
  import { useField, useForm } from "vee-validate";
  import { ref, computed, watch, reactive } from "vue";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useRoute } from "vue-router";
  import * as zod from "zod";
  import FileUploadService from "@/service/FileUploadService";
  import UploadImage from "@/components/Upload.vue";

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

  const emit = defineEmits([
    "onCancel",
    "onSubmit",
    "update:visible",
    "onUpdate",
  ]);

  const fileUploadService = reactive(new FileUploadService());
  const toast = useToast();

  const route = useRoute();
  const isDetail = computed(() => {
    return route.name === WIKI.DETAIL;
  });

  const isEdit = computed(() => {
    return Object.keys(props.selected || {}).length > 0;
  });

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
      thumbnailUrl: zod
        .string()
        .min(1, { message: "Thumbnail URL is Required" })
        .url({ message: "Must be a valid URL" }),
      imageUrl: zod
        .string()
        .min(1, { message: "Image URL is Required" })
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

  const {
    value: imageUrl,
    errorMessage: imageUrlError,
    setValue: setImageUrl,
    meta: metaImage,
  } = useField("imageUrl");

  const {
    value: thumbnailUrl,
    errorMessage: thumbnailUrlError,
    setValue: setThumbnailUrl,
    meta: metaThumbnail,
  } = useField("thumbnailUrl");

  const editorInstance = ref(null);

  // Editor Setup
  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      placeholder: "Let's write an awesome story!",
      readOnly: isDetail.value,
      autofocus: true,
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: "Enter a header",
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 1,
            shortcut: "CMD+SHIFT+H",
          },
        },
        list: List,
        image: SimpleImage,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool,
          config: {
            // https://github.com/editor-js/image
            // TODO: Create Custom Image Upload because we need to pass the cookies to the backend
            uploader: {
              /**
               * Upload file to the server and return an uploaded image data
               * @param {File} file - file selected from the device or pasted by drag-n-drop
               * @return {Promise.<{success, file: {url}}>}
               */
              uploadByFile(file) {
                // your own uploading logic here

                const formData = new FormData();
                formData.append("image", file);

                return fileUploadService
                  .upload(formData)
                  .then(({ data }) => {
                    if (data.success === 1) {
                      toast.add({
                        severity: "success",
                        summary: "Success Data",
                        detail: "Image uploaded successfully!",
                        life: 3000,
                      });

                      return {
                        success: 1,
                        file: {
                          url: data.file.url,
                        },
                      };
                    } else {
                      toast.add({
                        severity: "error",
                        summary: "Error Data",
                        detail: "Failed to upload image!",
                        life: 3000,
                      });
                    }
                  })
                  .catch((error) => {
                    console.error("Error in uploadByFile:", error);
                    toast.add({
                      severity: "error",
                      summary: "Error Data",
                      detail: "Failed to upload image!",
                      life: 3000,
                    });
                  });
              },
            },
            // endpoints: {
            //   byFile: import.meta.env.VITE_MINIO_URL,
            //   byUrl: "http://localhost:8008/fetchUrl",
            // },
          },
        },
        code: CodeTool,
        underline: Underline,
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: LINK_PREVIEW,
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

      if (isEdit.value) {
        emit("onUpdate", payload);
        return;
      }

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

  const onUploadImage = async (event) => {
    const file = event[0];
    const formData = new FormData();
    formData.append("image", file);

    await fileUploadService
      .upload(formData)
      .then(({ data }) => {
        if (data.success === 1) {
          toast.add({
            severity: "success",
            summary: "Success Data",
            detail: "Image uploaded successfully!",
            life: 3000,
          });

          setImageUrl(data.file.url);
        } else {
          toast.add({
            severity: "error",
            summary: "Error Data",
            detail: "Failed to upload image!",
            life: 3000,
          });
        }
      })
      .catch((error) => {
        console.error("Error in uploadByFile:", error);
        toast.add({
          severity: "error",
          summary: "Error Data",
          detail: "Failed to upload image!",
          life: 3000,
        });
      });
  };

  const onUploadThumbnail = async (event) => {
    const file = event[0];
    const formData = new FormData();
    formData.append("image", file);

    await fileUploadService
      .upload(formData)
      .then(({ data }) => {
        if (data.success === 1) {
          toast.add({
            severity: "success",
            summary: "Success Data",
            detail: "Thumbnail uploaded successfully!",
            life: 3000,
          });

          setThumbnailUrl(data.file.url);
        } else {
          toast.add({
            severity: "error",
            summary: "Error Data",
            detail: "Failed to upload thumbnail!",
            life: 3000,
          });
        }
      })
      .catch((error) => {
        console.error("Error in uploadByFile:", error);
        toast.add({
          severity: "error",
          summary: "Error Data",
          detail: "Failed to upload thumbnail!",
          life: 3000,
        });
      });
  };

  const onCancelImage = () => {
    setImageUrl(null);
  };

  const onCancelThumbnail = () => {
    setThumbnailUrl(null);
  };

  watch(visibleCombined, (newVal) => {
    if (newVal) {
      if (isEdit.value) {
        setValues({
          title: props.selected.title,
          description: props.selected.description,
          thumbnailUrl: props.selected.thumbnailUrl,
          imageUrl: props.selected.imageUrl,
          content: props.selected.content,
        });

        setValueContent(props.selected.content);
      }

      initEditor();
    } else {
      resetForm();
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

  /* Dark mode overrides for link tool */
  :deep(.link-tool__title) {
    color: var(--text-color);
  }

  :deep(.link-tool__description) {
    color: var(--text-secondary-color);
  }

  :deep(.link-tool__content) {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
  }
</style>
