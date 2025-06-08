<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { DASHBOARD, NEWS } from "@/router/constants";
  import NewsService from "@/service/NewsService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";
  import { useConfirm } from "primevue/useconfirm";
  import FileUploadService from "@/service/FileUploadService";
  import { LINK_PREVIEW } from "@/service/Instance/constants";

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

  const newsData = ref({
    title: "",
    content: "",
    imageUrl: "",
    description: "",
    author: {
      id: null,
      name: "",
      username: "",
      role: "",
    },
  });

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const newsService = reactive(new NewsService());
  const fileUploadService = reactive(new FileUploadService());

  const loading = ref(false);
  const editorInstance = ref(null);
  const disabled = ref(true);
  const loadingDelete = ref(false);
  const confirm = useConfirm();

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
      author: zod.object({
        id: zod.number(),
        name: zod.string(),
        username: zod.string(),
        role: zod.string(),
      }),
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
            } catch {
              return false;
            }
          },
          { message: "Please add some content to the editor" }
        ),
      // imageUrl: zod.string().min(1, { message: "Image is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
    })
  );

  const { handleSubmit, errors } = useForm({
    validationSchema,
  });

  const {
    value: content,
    errorMessage: contentError,
    setValue: setValueContent,
    meta: contentMeta,
    setTouched: setContentTouched,
  } = useField("content");

  const {
    value: imageUrl,
    setValue: setImageUrl,
    meta: metaImage,
    errorMessage: errorImage,
  } = useField("imageUrl");

  const breadcrumbHome = ref({ icon: "pi pi-home", route: DASHBOARD.LIST });

  const breadcrumbItems = ref([
    { label: "News List", route: NEWS.LIST },
    { label: "News Detail" },
  ]);

  // Editor Setup
  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      placeholder: "Let's write an awesome story!",
      readOnly: disabled.value,
      autofocus: !disabled.value,
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
      data: newsData.value.content ? JSON.parse(newsData.value.content) : {},
      onChange: async () => {
        if (disabled.value) return;
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

  onMounted(async () => {
    await getDetail();
    await initEditor();
  });

  const getDetail = async () => {
    try {
      loading.value = true;
      const id = route.params?.secureId;

      const { data } = await newsService.details(id);
      if (data.status === "success") {
        const result = data.data;
        setImageUrl(result.imageUrl);
        newsData.value = result;
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

  onBeforeUnmount(() => {
    if (editorInstance.value) {
      editorInstance.value.destroy();
    }
  });

  const onUpload = async (event) => {
    if (event?.xhr?.status == 200) {
      try {
        const { result } = await JSON.parse(event.xhr.response);
        newsData.value.imageUrl = result.imageUrl;
        setImageUrl(result.imageUrl);

        toast.add({
          severity: "success",
          summary: "Success",
          detail: "File Uploaded",
          life: 3000,
        });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Upload Failed",
          detail: "Image Upload Failed",
          life: 3000,
        });
      }
    }
  };

  const handleImageError = () => {
    toast.add({
      severity: "error",
      summary: "Upload Failed",
      detail: "Image Upload Failed",
      life: 3000,
    });
  };

  const handleImageRemove = () => {
    newsData.value.imageUrl = null;
    setImageUrl(null);
  };

  const onCancel = () => {
    router.replace({
      name: NEWS.LIST,
    });
  };

  const onEdit = () => {
    router.push({
      name: NEWS.UPDATE,
      params: {
        secureId: route.params.secureId,
      },
    });
  };

  const onDelete = () => {
    confirm.require({
      message: `Are you sure you want to delete ${newsData.value.title}?`,
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
        deleteNews();
      },
    });
  };

  async function deleteNews() {
    try {
      loadingDelete.value = true;
      const { data } = await newsService.delete(route.params?.secureId);

      if (data.status === "success") {
        router.replace({
          name: NEWS.LIST,
        });

        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "News Deleted",
          life: 3000,
        });
      } else {
        console.error(data);
        throw new Error("Failed to Delete News!");
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
</script>

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
      <div class="font-semibold text-2xl mb-8">News Detail</div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="newsData.title"
          :disabled="disabled"
        />
        <div class="flex flex-col">
          <div class="mb-2">Image</div>
          <img
            :src="newsData.imageUrl"
            :alt="newsData.title"
            class="w-full max-w-md rounded-lg shadow-lg mb-4"
          />
        </div>
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="newsData.description"
          rows="8"
          :disabled="disabled"
        />
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="author"
          label="Author"
          :values="`${newsData.author.name} (${newsData.author.role})`"
          :disabled="disabled"
        />
      </div>
    </div>

    <div class="card surface-ground mt-4">
      <div class="flex flex-col">
        <div class="mb-2">
          <p class="font-semibold text-2xl mb-8">About News</p>
        </div>
        <div id="editorjs" class="editor-wrapper"></div>
        <small v-if="contentError" class="text-red-500">{{
          contentError
        }}</small>
      </div>
    </div>

    <div class="card surface-ground py-5 mt-4">
      <div class="flex px-4">
        <div class="flex gap-3">
          <Button
            label="Back to List"
            icon="pi pi-arrow-left"
            severity="secondary"
            class="w-[130px]"
            outlined
            @click="onCancel"
          />
          <Button
            label="Edit News"
            icon="pi pi-pencil"
            severity="primary"
            class="dark:text-white"
            @click="onEdit"
          />
          <Button
            :loading="loadingDelete"
            label="Delete News"
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
