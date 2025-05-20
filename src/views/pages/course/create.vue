<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import CardCourse from "@/components/Card/CardCourse.vue";
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

  const saveData = async () => {
    const data = {
      ...courseData.value,
      content: contentCovered.value,
    };
    console.log(data);
  };

  const contentCovered = ref([
    {
      level: 1,
      title: "Introduction to 3D Modelling",
      is_locked: false,
      sub_contents: [
        {
          number: "01",
          title: "Understanding Digi-Doubles",
          description:
            "Learn what Digi-Doubles are and their significance in modern VFX.",
          is_open: false,
          courses: [
            {
              title: "Understanding Digi-Doubles",
              description:
                "Learn what Digi-Doubles are and their significance in modern VFX.",
              is_checked: true,
            },
            {
              title: "Getting Started with Midjourney",
              description:
                "Learn what Digi-Doubles are and their significance in modern VFX.",
              is_checked: false,
            },
          ],
        },
        {
          number: "02",
          title: "Getting Started with Midjourney",
          description:
            "A brief introduction to using Midjourney for creating stunning visuals.",
          is_open: false,
          courses: [
            {
              title: "Understanding Digi-Doubles",
              description:
                "Learn what Digi-Doubles are and their significance in modern VFX.",
              is_checked: true,
            },
          ],
        },
      ],
    },
    {
      level: 2,
      title: "Introducing Midjourney",
      image: "https://picsum.photos/160/90",
      description: "Learn how to use Midjourney to create stunning visuals.",
      linked_course: "url/link/to/course",
      date: ["01/01/2024", "01/02/2024"],
    },
  ]);

  const dialogVisible = ref(false);
  const dialogData = ref({}); // for add/edit
  const dialogMode = ref("add-level"); // or "edit"

  const addLevelMode = computed(() => {
    return dialogMode.value === "add-level";
  });

  const addCourseMode = computed(() => {
    return dialogMode.value === "add-course";
  });

  const addSubContentMode = computed(() => {
    return dialogMode.value === "add-sub-content";
  });

  const editCourseMode = computed(() => {
    return dialogMode.value === "edit-course";
  });

  const editSubContentMode = computed(() => {
    return dialogMode.value === "edit-sub-content";
  });

  function addLevel() {
    dialogMode.value = "add-level";
    dialogVisible.value = true;
  }

  function addSubContent(levelIndex) {
    dialogMode.value = "add-sub-content";
    dialogData.value = {
      number: String(
        contentCovered.value[levelIndex].sub_contents.length + 1
      ).padStart(2, "0"),
      title: "",
      description: "",
      is_open: false,
      courses: [],
      levelIndex,
    };
    dialogVisible.value = true;
  }

  function addCourse(levelIndex, subContentIndex) {
    dialogMode.value = "add-course";
    dialogData.value = {
      courses: [
        {
          title: "",
          description: "",
          is_checked: false,
        },
      ],
      levelIndex,
      subContentIndex,
    };
    dialogVisible.value = true;
  }

  function editCourse(levelIndex, subContentIndex, courseIndex) {
    dialogMode.value = "edit-course";
    const course =
      contentCovered.value[levelIndex].sub_contents[subContentIndex].courses[
        courseIndex
      ];
    dialogData.value = {
      title: course.title,
      description: course.description,
      levelIndex,
      subContentIndex,
      courseIndex,
    };
    dialogVisible.value = true;
  }

  function deleteCourse(levelIndex, subContentIndex, courseIndex) {
    contentCovered.value[levelIndex].sub_contents[
      subContentIndex
    ].courses.splice(courseIndex, 1);
  }

  function editSubContent(levelIndex, subContentIndex) {
    dialogMode.value = "edit-sub-content";
    const subContent =
      contentCovered.value[levelIndex].sub_contents[subContentIndex];
    dialogData.value = {
      number: subContent.number,
      title: subContent.title,
      description: subContent.description,
      levelIndex,
      subContentIndex,
    };
    dialogVisible.value = true;
  }

  function saveDialog() {
    if (addCourseMode.value) {
      // Add course
      contentCovered.value[dialogData.value.levelIndex].sub_contents[
        dialogData.value.subContentIndex
      ].courses.push({
        title: dialogData.value.title,
        description: dialogData.value.description,
        is_checked: false,
      });
    } else if (addSubContentMode.value) {
      // Add sub-content
      contentCovered.value[dialogData.value.levelIndex].sub_contents.push({
        number: dialogData.value.number,
        title: dialogData.value.title,
        description: dialogData.value.description,
        is_open: false,
        courses: [],
      });
    } else if (editCourseMode.value) {
      // Edit course
      const { levelIndex, subContentIndex, courseIndex, title, description } =
        dialogData.value;
      const course =
        contentCovered.value[levelIndex].sub_contents[subContentIndex].courses[
          courseIndex
        ];
      course.title = title;
      course.description = description;
    } else if (editSubContentMode.value) {
      // Edit sub-content
      const { levelIndex, subContentIndex, title, description } =
        dialogData.value;
      const subContent =
        contentCovered.value[levelIndex].sub_contents[subContentIndex];
      subContent.title = title;
      subContent.description = description;
    }
    dialogVisible.value = false;
  }

  const handleSelectedCourses = (courses) => {
    courses = {
      ...courses,
      level: contentCovered.value.length + 1,
      linked_course: "url/link/to/course/" + courses.id,
    };

    contentCovered.value.push(courses);
    dialogMode.value = "add-course";
    dialogVisible.value = false;
  };

  const deleteDialog = ref(false);
  const deleteData = ref(null);

  function deleteSubContent(levelIndex, subContentIndex) {
    deleteDialog.value = true;
    deleteData.value = {
      type: "sub-content",
      levelIndex,
      subContentIndex,
      title:
        contentCovered.value[levelIndex].sub_contents[subContentIndex].title,
    };
  }

  function confirmDelete() {
    if (deleteData.value.type === "sub-content") {
      const { levelIndex, subContentIndex } = deleteData.value;
      contentCovered.value[levelIndex].sub_contents.splice(subContentIndex, 1);

      // Renumber remaining sub-contents
      contentCovered.value[levelIndex].sub_contents.forEach(
        (subContent, index) => {
          subContent.number = String(index + 1).padStart(2, "0");
        }
      );
    } else if (deleteData.value.type === "level") {
      const { levelIndex } = deleteData.value;
      contentCovered.value.splice(levelIndex, 1);

      // Renumber remaining levels
      contentCovered.value.forEach((level, index) => {
        level.level = index + 1;
      });
    }
    deleteDialog.value = false;
    deleteData.value = null;
  }

  const menu = ref();
  const menuItems = ref([]);

  function showMenu(event, levelIndex, subContentIndex) {
    menuItems.value = [
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () => {
          editSubContent(levelIndex, subContentIndex);
        },
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        class: "text-red-500",
        command: () => {
          deleteSubContent(levelIndex, subContentIndex);
        },
      },
    ];
    menu.value.toggle(event);
  }

  const levelMenu = ref();
  const levelMenuItems = ref([]);

  function showLevelMenu(event, levelIndex) {
    levelMenuItems.value = [
      {
        label: "Delete Course",
        icon: "pi pi-trash",
        class: "text-red-500",
        command: () => {
          deleteLevel(levelIndex);
        },
      },
    ];
    levelMenu.value.toggle(event);
  }

  function editLevel(levelIndex) {
    dialogMode.value = "edit";
    const level = contentCovered.value[levelIndex];
    dialogData.value = {
      level: level.level,
      title: level.title,
      description: "", // Add description field
      videoUrl: "", // Add video URL field
      isVideo: false, // Add isVideo field
      levelIndex,
    };
    dialogVisible.value = true;
  }

  function deleteLevel(levelIndex) {
    deleteDialog.value = true;
    deleteData.value = {
      type: "level",
      levelIndex,
      title: contentCovered.value[levelIndex].title,
    };
  }

  const courseMenu = ref();
  const courseMenuItems = ref([]);

  function showCourseMenu(event, levelIndex, subContentIndex, courseIndex) {
    courseMenuItems.value = [
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () => {
          editCourse(levelIndex, subContentIndex, courseIndex);
        },
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        class: "text-red-500",
        command: () => {
          deleteCourse(levelIndex, subContentIndex, courseIndex);
        },
      },
    ];
    courseMenu.value.toggle(event);
  }

  const handleDialogHeader = computed(() => {
    if (addLevelMode.value) {
      return "Add Level";
    } else if (addCourseMode.value) {
      return "Add Course";
    } else if (addSubContentMode.value) {
      return "Add Sub-Content";
    } else if (editCourseMode.value) {
      return "Edit Course";
    } else if (editSubContentMode.value) {
      return "Edit Sub-Content";
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
  </div>

  <div class="card mb-2">
    <p class="font-semibold text-2xl mb-8">Create Course</p>
    <div class="flex flex-col gap-4 w-full">
      <FieldText
        className="flex flex-col flex-wrap gap-2 w-full"
        name="title"
        label="Title"
        :values="courseData.title"
      />
      <FieldTextArea
        className="flex flex-col flex-wrap gap-2 w-full"
        name="description"
        label="Description"
        :values="courseData.description"
      />
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="videoUrl"
          label="Video URL"
          :values="courseData.videoUrl"
        />
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="flex flex-col col-span-6 gap-2">
          <label for="courseLevel">Level</label>
          <Select
            id="courseLevel"
            v-model="selectedCourseLevel"
            display="chip"
            :options="courseLevel"
            optionLabel="label"
            filter
            placeholder="Select Course Level"
            class="w-full"
          />
        </div>
        <div class="flex flex-col col-span-6 gap-2">
          <label for="courseType">Type</label>
          <SelectButton
            id="courseType"
            v-model="selectedCourseType"
            :options="courseType"
            optionLabel="label"
            filter
            placeholder="Select Course Type"
            class="w-full"
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
    <div class="col-span-4 card">
      <p class="font-semibold text-2xl mb-8">Content Covered</p>
      <Accordion :multiple="true">
        <AccordionTab v-for="(level, lIdx) in contentCovered" :key="lIdx">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <span>Level {{ level.level }}: {{ level.title }}</span>
              <div class="flex items-center gap-2 p-1">
                <Button
                  v-if="level.linked_course"
                  icon="pi pi-ellipsis-v"
                  text
                  size="small"
                  @click.stop="showLevelMenu($event, lIdx)"
                />
                <Chip
                  v-else
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
                <template #icons>
                  <Button
                    icon="pi pi-ellipsis-v"
                    text
                    size="small"
                    @click.stop="showMenu($event, lIdx, sIdx)"
                  />
                </template>
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
                    <Button
                      icon="pi pi-ellipsis-v"
                      text
                      size="small"
                      @click.stop="
                        showCourseMenu($event, lIdx, sIdx, courseIdx)
                      "
                    />
                  </li>
                </ul>
                <Button
                  label="Add Course"
                  icon="pi pi-plus"
                  text
                  size="small"
                  @click="addCourse(lIdx, sIdx)"
                />
              </Panel>
            </div>
            <Button
              label="Add Sub-Content"
              icon="pi pi-plus"
              text
              size="small"
              @click="addSubContent(lIdx)"
              class="mt-2"
            />
          </template>
        </AccordionTab>
      </Accordion>
      <Button
        label="Add Level"
        icon="pi pi-plus"
        class="mt-4"
        @click="addLevel"
      />
    </div>
  </div>
  <div class="card surface-ground py-5 mt-4">
    <div class="flex justify-end px-4">
      <div class="flex gap-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="w-[130px]"
          @click="onCancel"
        />
        <Button
          label="Save Course"
          icon="pi pi-check"
          severity="primary"
          class="w-[130px]"
          @click="saveData"
          :loading="loadingSubmit"
        />
      </div>
    </div>
  </div>

  <!-- Dialog for Add/Edit -->
  <Dialog
    v-model:visible="dialogVisible"
    :header="handleDialogHeader"
    modal
    :style="{ width: '640px' }"
  >
    <!-- Form Section -->
    <div class="flex flex-col gap-4">
      <!-- For Level -->
      <template v-if="addLevelMode">
        <CardCourses @selected-courses="handleSelectedCourses" />
      </template>

      <!-- For Course -->
      <template v-if="addCourseMode || editCourseMode">
        <div class="flex flex-col gap-3">
          <div class="field">
            <label class="font-medium mb-2 block">Course Title</label>
            <InputText
              v-model="dialogData.title"
              class="w-full"
              placeholder="Enter course title"
            />
          </div>
          <div class="field">
            <label class="font-medium mb-2 block">Course Description</label>
            <Textarea
              v-model="dialogData.description"
              class="w-full"
              placeholder="Enter course description"
              rows="3"
            />
          </div>
        </div>
      </template>

      <!-- For Sub-Content -->
      <template v-else-if="dialogData.number !== undefined">
        <InputText
          v-model="dialogData.number"
          class="w-full"
          placeholder="Sub-Content Number"
          disabled
        />
        <InputText
          v-model="dialogData.title"
          class="w-full"
          placeholder="Sub-Content Title"
        />
        <Textarea
          v-model="dialogData.description"
          class="w-full"
          placeholder="Sub-Content Description"
          rows="3"
        />
      </template>

      <div v-if="!addLevelMode" class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          text
          @click="dialogVisible = false"
        />
        <Button label="Save" icon="pi pi-check" @click="saveDialog" />
      </div>
    </div>
  </Dialog>

  <!-- Level Menu -->
  <Menu ref="levelMenu" :model="levelMenuItems" :popup="true" />

  <!-- Sub-content Menu -->
  <Menu ref="menu" :model="menuItems" :popup="true" />

  <!-- Course Menu -->
  <Menu ref="courseMenu" :model="courseMenuItems" :popup="true" />

  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="deleteDialog"
    modal
    header="Confirm Deletion"
    :style="{ width: '450px' }"
  >
    <div class="flex align-items-center gap-3">
      <i
        class="pi pi-exclamation-triangle text-xl"
        style="color: var(--red-500)"
      />
      <span>
        Are you sure you want to delete <strong>{{ deleteData?.title }}</strong
        >?
        <br />
        <small class="text-red-500" v-if="deleteData?.type === 'level'">
          This will delete all sub-contents and courses within this level.
        </small>
        <small class="text-red-500" v-else>
          This will delete all courses within this section.
        </small>
      </span>
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        text
        @click="deleteDialog = false"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        @click="confirmDelete"
      />
    </template>
  </Dialog>
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

  :deep(.p-menu) {
    width: 200px;
  }
  :deep(.p-menu .p-menuitem-link .p-menuitem-text) {
    color: var(--text-color);
  }
  :deep(.p-menu .p-menuitem-link .p-menuitem-icon) {
    color: var(--text-color);
  }
  :deep(.p-menu .p-menuitem-link.text-red-500 .p-menuitem-text) {
    color: var(--red-500);
  }
  :deep(.p-menu .p-menuitem-link.text-red-500 .p-menuitem-icon) {
    color: var(--red-500);
  }
</style>
