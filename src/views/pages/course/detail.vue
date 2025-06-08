<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { COURSE, DASHBOARD } from "@/router/constants";
  import CourseService from "@/service/CourseService";
  import FileUploadService from "@/service/FileUploadService";
  import { LINK_PREVIEW } from "@/service/Instance/constants";

  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useConfirm } from "primevue/useconfirm";
  import { useForm } from "vee-validate";
  import Calendar from "primevue/calendar";

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
  const confirm = useConfirm();
  const courseService = reactive(new CourseService());
  const fileUploadService = reactive(new FileUploadService());
  const loading = ref(false);
  const editorInstance = ref(null);

  const breadcrumbHome = ref({ icon: "pi pi-home", route: DASHBOARD.LIST });
  const breadcrumbItems = ref([
    { label: "Course List", route: COURSE.LIST },
    { label: "Course Detail" },
  ]);

  const loadingDelete = ref(false);

  const courseData = ref({
    id: 1,
    title: "",
    description: "",
    level: "",
    type: "",
    content: "",
    startDate: null,
    endDate: null,
    videoUrl: "",
    imageUrl: "",
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

  const contentCovered = ref([]);

  const { setFieldValue, values } = useForm();

  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      readOnly: true,
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
            uploader: {
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
      data: courseData.value.content
        ? JSON.parse(courseData.value.content)
        : {},
    });
  };

  const getDetail = async () => {
    try {
      loading.value = true;
      const secureId = route.params?.secureId;

      const response = await courseService.details(secureId);

      const {
        data: { data: course, status },
      } = response;

      if (status == "success") {
        setFieldValue("title", course?.title || "");
        setFieldValue("description", course?.description || "");
        setFieldValue("videoUrl", course?.videoUrl || "");
        setFieldValue("imageUrl", course?.imageUrl || "");
        setFieldValue("startDate", course?.startDate || null);
        setFieldValue("endDate", course?.endDate || null);

        // Basic course information
        courseData.value = {
          id: course?.id || 0,
          title: course?.title || "",
          description: course?.description || "",
          videoUrl: course?.videoUrl || "",
          imageUrl: course?.imageUrl || "",
          level: course?.level || "",
          type: course?.type || "",
          content: course?.content || "",
          startDate: course?.startDate ? new Date(course.startDate) : null,
          endDate: course?.endDate ? new Date(course.endDate) : null,
        };

        // Handle content covered
        contentCovered.value = Array.isArray(course?.contentCovered)
          ? course.contentCovered
          : [];

        // Initialize Editor with content if available
        if (editorInstance.value && course?.content) {
          try {
            const parsedContent =
              typeof course.content === "string"
                ? JSON.parse(course.content)
                : course.content;
            editorInstance.value.render(parsedContent);
          } catch (error) {
            console.error("Error rendering editor content:", error);
          }
        }

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

  const onEdit = () => {
    router.push({
      name: COURSE.UPDATE,
      params: {
        secureId: route.params?.secureId,
      },
    });
  };

  const onDelete = (item) => {
    confirm.require({
      message: "Are you sure you want to delete this course?",
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
        deleteCourse();
      },
    });
  };

  const deleteCourse = async () => {
    const secureId = route.params?.secureId;
    try {
      loadingDelete.value = true;
      const {
        data: { status },
      } = await courseService.delete(secureId);
      if (status == "success") {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Course deleted successfully",
        });

        router.replace({
          name: COURSE.LIST,
        });
      }
    } catch (error) {
      console.error("Error in deleteCourse:", error);
    } finally {
      loadingDelete.value = false;
    }
  };

  onMounted(async () => {
    await getDetail();
    await initEditor();
  });
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
      <p class="font-semibold text-2xl mb-8">Course Detail</p>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="courseData.title"
          readOnly
        />
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="courseData.description"
          readOnly
          rows="5"
        />
        <div class="flex flex-col gap-4 w-full">
          <div class="flex flex-col">
            <div class="mb-2">Image</div>
            <img :src="values.imageUrl" alt="Image Preview" class="w-full" />
          </div>
          <FieldText
            className="flex flex-col flex-wrap gap-2 w-full"
            name="videoUrl"
            label="Video URL"
            :values="courseData.videoUrl"
            readOnly
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
              optionValue="value"
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
              optionValue="value"
              filter
              placeholder="Select Course Type"
              class="w-full"
              disabled
            />
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="flex flex-col col-span-6 gap-2">
            <label for="startDate">Start Date</label>
            <Calendar
              id="startDate"
              v-model="courseData.startDate"
              dateFormat="dd/mm/yy"
              placeholder="Select Start Date"
              class="w-full"
              :showIcon="true"
              disabled
            />
          </div>
          <div class="flex flex-col col-span-6 gap-2">
            <label for="endDate">End Date</label>
            <Calendar
              id="endDate"
              v-model="courseData.endDate"
              dateFormat="dd/mm/yy"
              placeholder="Select End Date"
              class="w-full"
              :showIcon="true"
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
                  <span>
                    Level {{ level.level }}: {{ level?.courses?.title }}
                  </span>
                </div>
                <div class="flex items-center gap-2 p-1">
                  <Chip
                    v-if="level.type == 'PARENT'"
                    label="Current Course"
                    class="p-chip-success mr-3"
                  />
                </div>
              </div>
            </template>

            <!-- If the level is linked to a course -->
            <template v-if="level.type == 'CHILDREN'">
              <CardCourse :item="level.courses" />
            </template>

            <template v-else>
              <div
                v-for="(subContent, sIdx) in level.subContents"
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
                      v-for="(course, courseIdx) in subContent.subCourses"
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
      <div class="flex justify-start gap-3 px-4">
        <Button
          label="Back to List"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="onBack"
        />
        <Button
          label="Edit Course"
          icon="pi pi-pencil"
          severity="primary"
          class="dark:text-white"
          @click="onEdit"
        />
        <Button
          :loading="loadingDelete"
          label="Delete Course"
          icon="pi pi-trash"
          severity="danger"
          class="dark:text-white"
          @click="onDelete"
        />
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

  :deep(.p-accordion-header-link) {
    cursor: pointer !important;
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
