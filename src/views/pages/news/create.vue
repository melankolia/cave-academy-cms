<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { NEWS } from "@/router/constants";
  import NewsService from "@/service/NewsService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";

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
  });

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const newsService = reactive(new NewsService());
  const loadingSubmit = ref(false);
  const loading = ref(false);
  const editorInstance = ref(null);

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
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

  const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });

  const isUpdate = computed(() => {
    return route.params?.secureId;
  });

  const breadcrumbItems = ref([
    { label: "News List", url: "/news" },
    { label: "News " + (isUpdate.value ? "Update" : "Create") },
  ]);

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
      data: newsData.value.content ? JSON.parse(newsData.value.content) : {},
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

  onMounted(async () => {
    if (isUpdate.value) await getDetail();

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

  const saveData = handleSubmit(async (values) => {
    try {
      loadingSubmit.value = true;

      // Get the editor content
      let editorContent = "";
      if (editorInstance.value) {
        const outputData = await editorInstance.value.save();
        editorContent = JSON.stringify(outputData);
      }

      const payload = {
        title: values?.title,
        content: editorContent || values?.content,
        description: values?.description,
        imageUrl: "https://picsum.photos/800/600",
        authorId: 12,
      };

      let type = "create";
      if (isUpdate.value) type = "update";

      const id = newsData.value?.id;

      const {
        data: { data, status },
      } = await newsService[type](payload, id);

      if (status === "success") {
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: `News ${isUpdate.value ? "Updated" : "Created"}`,
          life: 3000,
        });
        router.replace({
          name: NEWS.DETAIL,
          params: {
            secureId: data.id,
          },
        });
      } else {
        throw new Error(`News ${isUpdate.value ? "Update" : "Create"} Failed`);
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: error.message,
        life: 3000,
      });
    } finally {
      loadingSubmit.value = false;
    }
  });
</script>

<template>
  <div class="card">
    <Toolbar>
      <template #start>
        <Breadcrumb
          style="padding: 4px"
          :home="breadcrumbHome"
          :model="breadcrumbItems"
        />
      </template>
    </Toolbar>
    <div v-if="loading">
      <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
      <SkeletonCard />
    </div>
    <template v-else>
      <div class="font-semibold text-2xl mt-8 mb-6">
        {{ isUpdate ? "Update" : "Create" }} News
      </div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="newsData.title"
        />
        <div class="flex flex-col">
          <div class="mb-2">Image</div>
          <FileUpload
            @error="handleImageError"
            :url="`/api/v1/upload`"
            name="image"
            @upload="onUpload"
            accept="image/*"
            @clear="handleImageRemove"
            @remove="handleImageRemove"
            :maxFileSize="1000000"
          >
            <template #empty>
              <div v-if="newsData.imageUrl" class="flex items-center flex-col">
                <img
                  :src="newsData.imageUrl"
                  :alt="newsData.title"
                  class="w-full max-w-md rounded-lg shadow-lg mb-4"
                />
                <p class="text-gray-600">
                  Drag and drop or click to replace image
                </p>
              </div>
              <p v-else class="text-gray-600">
                Drag and drop image here or click to upload
              </p>
            </template>
          </FileUpload>
          <small v-if="!metaImage.valid" class="text-red-500">{{
            errorImage
          }}</small>
        </div>
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="newsData.description"
          rows="8"
        />
      </div>
    </template>
  </div>

  <div class="card surface-ground py-5 mt-4">
    <div class="flex flex-col">
      <div class="mb-2">Content</div>
      <div id="editorjs" class="editor-wrapper"></div>
      <small v-if="contentError" class="text-red-500">{{ contentError }}</small>
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
          label="Save News"
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
