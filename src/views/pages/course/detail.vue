<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { COURSE } from "@/router/constants";
  import CourseService from "@/service/CourseService";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

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

  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const courseService = reactive(new CourseService());
  const loading = ref(false);
  const editorInstance = ref(null);

  const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
  const breadcrumbItems = ref([
    { label: "Course List", url: "/course" },
    { label: "Course Detail" },
  ]);

  const courseData = ref({
    id: 1,
    title: "",
    description: "",
    level: "",
    type: "",
    content: "",
  });

  const courseType = ref([
    { label: "Offline", value: "offline" },
    { label: "Online", value: "online" },
  ]);

  const courseLevel = ref([
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Expert", value: "expert" },
  ]);

  const selectedCourseType = ref(null);
  const selectedCourseLevel = ref(null);

  const contentCovered = ref([]);

  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      readOnly: true,
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
      data: courseData.value.content
        ? JSON.parse(courseData.value.content)
        : {},
    });
  };

  onMounted(async () => {
    await getDetail();
    await initEditor();
  });

  const getDetail = async () => {
    try {
      loading.value = true;
      const secureId = route.params?.secureId;

      const response = await courseService.details(secureId);
      console.log("API Response:", response);

      const {
        data: { data, message },
      } = response;

      if (message === "OK") {
        console.log("Course Data:", data);

        // Basic course information
        courseData.value = {
          id: data?.id || 0,
          title: data?.title || "",
          description: data?.description || "",
          videoUrl: data?.videoUrl || "",
          isVideo: Boolean(data?.videoUrl),
          // Handle photos and thumbnails
          photos: Array.isArray(data?.photoVos) ? data.photoVos : [],
          thumbnails: data?.thumbnails || "",
          // Handle tags
          tags: Array.isArray(data?.tagResponseVos) ? data.tagResponseVos : [],
          // Handle content for EditorJS
          content: data?.content || "",
        };

        console.log("Processed Course Data:", courseData.value);

        // Handle course type selection
        selectedCourseType.value =
          data?.type === "online"
            ? courseType.value[1] // online
            : courseType.value[0]; // offline

        // Handle course level selection
        selectedCourseLevel.value =
          courseLevel.value.find((level) => level.value === data?.level) ||
          courseLevel.value[0];

        // Handle content covered
        contentCovered.value = Array.isArray(data?.contentCovered)
          ? data.contentCovered
          : [];

        console.log("Content Covered:", contentCovered.value);
      } else {
        throw new Error("Failed to fetch data!");
      }
    } catch (error) {
      console.error("Error in getDetail:", error);
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: error.message || "Failed to fetch data!",
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const onBack = () => {
    router.push({
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

  <div class="card mb-2">
    <p class="font-semibold text-2xl mb-8">Course Detail</p>
    <div class="flex flex-col gap-4 w-full">
      <FieldText
        className="flex flex-col flex-wrap gap-2 w-full"
        name="title"
        label="Title"
        :values="courseData.title"
        disabled
      />
      <FieldTextArea
        className="flex flex-col flex-wrap gap-2 w-full"
        name="description"
        label="Description"
        :values="courseData.description"
        disabled
        rows="5"
      />
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="videoUrl"
          label="Video URL"
          :values="courseData.videoUrl"
          disabled
        />
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="flex flex-col col-span-6 gap-2">
          <label for="courseLevel">Level</label>
          <Select
            id="courseLevel"
            v-model="courseData.level"
            display="chip"
            :options="courseLevel"
            optionLabel="label"
            filter
            placeholder="Select Course Level"
            class="w-full"
            disabled
          />
        </div>
        <div class="flex flex-col col-span-6 gap-2">
          <label for="courseType">Type</label>
          <SelectButton
            id="courseType"
            v-model="courseData.type"
            :options="courseType"
            optionLabel="label"
            filter
            placeholder="Select Course Type"
            class="w-full"
            disabled
          />
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-2">
    <div class="col-span-8 card m-0">
      <p class="font-semibold text-2xl mb-8">About Course</p>
      <div class="editor-container">
        <div id="editorjs" class="editor-wrapper"></div>
      </div>
    </div>
    <div class="col-span-4 card h-full">
      <p class="font-semibold text-2xl mb-8">Content Covered</p>
      <Accordion :multiple="true">
        <AccordionTab v-for="(level, lIdx) in contentCovered" :key="lIdx">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-4">
                <span>Level {{ level.level }}: {{ level.title }}</span>
              </div>
              <div class="flex items-center gap-2 p-1">
                <Chip
                  v-if="!level.linked_course"
                  label="Current Course"
                  class="p-chip-success mr-3"
                />
              </div>
            </div>
          </template>

          <!-- If the level is linked to a course -->
          <template v-if="level.linked_course">
            <CardCourse :item="level" />
          </template>

          <template v-else>
            <div
              v-for="(subContent, sIdx) in level.sub_contents"
              :key="sIdx"
              class="mb-4"
            >
              <Panel
                :header="subContent.number + '. ' + subContent.title"
                toggleable
              >
                <p class="text-gray-600 mb-4">{{ subContent.description }}</p>
                <ul class="pl-4">
                  <li
                    v-for="(course, courseIdx) in subContent.courses"
                    :key="courseIdx"
                    class="flex items-center gap-2 mb-2"
                  >
                    <div class="flex-1">
                      <div class="font-medium">{{ course.title }}</div>
                      <div class="text-sm text-gray-600">
                        {{ course.description }}
                      </div>
                    </div>
                  </li>
                </ul>
              </Panel>
            </div>
          </template>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
  <div class="card surface-ground py-5 mt-4">
    <div class="flex justify-end px-4">
      <Button
        label="Back to List"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        class="w-[130px]"
        @click="onBack"
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

  :deep(.p-accordion-header-link) {
    cursor: pointer !important;
  }
</style>
