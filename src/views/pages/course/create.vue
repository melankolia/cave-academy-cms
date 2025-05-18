<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { COURSE } from "@/router/constants";
  import CourseService from "@/service/CourseService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import {
    computed,
    onMounted,
    onBeforeUnmount,
    reactive,
    ref,
    watch,
  } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";

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

  const courseData = ref({
    title: "",
    description: "",
    photos: "",
    thumbnails: "",
    videoUrl: "",
    isVideo: false,
    tags: "",
    content: "",
  });

  const toast = useToast();
  const route = useRoute();
  const router = useRouter();
  const courseService = reactive(new CourseService());
  const loadingSubmit = ref(false);
  const loading = ref(false);
  const editorInstance = ref(null);

  const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });

  const isUpdate = computed(() => {
    return route.params?.secureId;
  });

  const breadcrumbItems = ref([
    { label: "Course List", url: "/course" },
    { label: "Course " + (isUpdate.value ? "Update" : "Create") },
  ]);

  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      placeholder: "Let's write an awesome story!",
      readOnly: false,
      autofocus: true,
      tools: {
        // Add your tools configuration here
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
              byFile: "http://localhost:8008/uploadFile", // Your backend file uploader endpoint
              byUrl: "http://localhost:8008/fetchUrl", // Your endpoint that provides uploading by Url
            },
          },
        },
        code: CodeTool,
        underline: Underline,
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: "http://localhost:8008/fetchUrl", // Your backend endpoint for url data fetching,
          },
        },
        raw: RawTool,
        embed: Embed,
        quote: Quote,
      },
      data: courseData.value.content
        ? JSON.parse(courseData.value.content)
        : {},
      onChange: async () => {
        const outputData = await editorInstance.value.save();
        console.log(outputData);
        courseData.value.content = JSON.stringify(outputData);
      },
    });
  };

  onMounted(async () => {
    await initEditor();
  });

  onBeforeUnmount(() => {
    if (editorInstance.value) {
      editorInstance.value.destroy();
    }
  });

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
      thumbnails: zod.string().min(1, { message: "Thumbnail is Required" }),
      tags: zod.union([
        zod.string().min(1, { message: "Tag's is Required" }),
        zod
          .string()
          .array()
          .nonempty({ message: "Atleast one tag is required" }),
      ]),
      videoUrl: zod.string().optional().nullable(),
      isVideo: zod.boolean().optional(),
      photos: zod.string().nullable(),
      content: zod.string().nullable(),
    })
  );
  const { handleSubmit } = useForm({
    validationSchema,
  });

  const onCancel = () => {
    router.replace({
      name: COURSE.LIST,
    });
  };
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
  </div>

  <div class="card">
    <p class="font-semibold text-2xl mb-8">Content</p>
    <div class="editor-container">
      <div id="editorjs" class="editor-wrapper"></div>
    </div>

    <div class="flex flex-row justify-end mt-16 gap-4">
      <Button
        label="Cancel"
        icon="pi pi-times"
        severity="danger"
        text
        @click="onCancel"
      />
      <Button
        label="Submit"
        icon="pi pi-check"
        @click="saveData"
        :loading="loadingSubmit"
      />
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
