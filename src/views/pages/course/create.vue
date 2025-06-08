<script setup>
  // Core Vue and Router imports
  import {
    computed,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    watch,
  } from "vue";
  import { useRoute, useRouter } from "vue-router";

  // Components
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import CardCourse from "@/components/Card/CardCourse.vue";
  import UploadImage from "@/components/Upload.vue";

  // Services and Constants
  import { COURSE, DASHBOARD } from "@/router/constants";
  import CourseService from "@/service/CourseService";
  import FileUploadService from "@/service/FileUploadService";
  import { LINK_PREVIEW } from "@/service/Instance/constants";

  // Form Validation
  import { toTypedSchema } from "@vee-validate/zod";
  import { useField, useForm } from "vee-validate";
  import * as zod from "zod";

  // UI Components
  import { useToast } from "primevue/usetoast";

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

  // Course Data and Options
  const courseData = ref({
    id: 1,
    title: "",
    description: "",
    level: "",
    type: "",
    content: "",
    startDate: null,
    endDate: null,
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

  // Core Setup
  const toast = useToast();
  const route = useRoute();
  const router = useRouter();
  const courseService = reactive(new CourseService());
  const fileUploadService = reactive(new FileUploadService());

  const loadingSubmit = ref(false);
  const loading = ref(false);
  const editorInstance = ref(null);

  // Breadcrumb Setup
  const breadcrumbHome = ref({ icon: "pi pi-home", route: DASHBOARD.LIST });
  const isUpdate = computed(() => {
    return route.params?.secureId;
  });
  const breadcrumbItems = ref([
    { label: "Course List", route: COURSE.LIST },
    { label: "Course " + (isUpdate.value ? "Update" : "Create") },
  ]);

  // Form Validation Schema
  const validationSchema = toTypedSchema(
    zod
      .object({
        title: zod.string().min(1, { message: "Title is Required" }),
        description: zod
          .string()
          .min(1, { message: "Description is Required" }),
        videoUrl: zod
          .string()
          .min(1, { message: "Video URL is Required" })
          .url({ message: "Must be a valid URL" }),
        imageUrl: zod
          .string()
          .min(1, { message: "Image URL is Required" })
          .url({ message: "Must be a valid URL" }),
        level: zod.union([
          zod.string().min(1, { message: "Level is Required" }),
        ]),
        type: zod
          .union([
            zod.string().min(1, { message: "Type is Required" }),
            zod.null(),
          ])
          .refine((val) => val !== null, {
            message: "Type is Required",
          }),
        startDate: zod
          .date({
            required_error: "Start Date is Required",
            invalid_type_error: "Start Date must be a date",
          })
          .nullable(),
        endDate: zod
          .date({
            required_error: "End Date is Required",
            invalid_type_error: "End Date must be a date",
          })
          .nullable(),
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
      })
      .refine(
        (data) => {
          if (!data.startDate || !data.endDate) return true;
          return data.endDate > data.startDate;
        },
        {
          message: "End Date must be after Start Date",
          path: ["endDate"], // This shows the error on the endDate field
        }
      )
  );

  // Form Setup
  const { handleSubmit, errors, meta, setFieldValue } = useForm({
    validationSchema,
    initialValues: {
      content: "",
      title: courseData.value.title,
      description: courseData.value.description,
      level: courseData.value.level,
      type: courseData.value.type,
      videoUrl: courseData.value.videoUrl,
      imageUrl: courseData.value.imageUrl,
      startDate: null,
      endDate: null,
    },
  });

  const {
    value: content,
    errorMessage: contentError,
    setValue: setValueContent,
    meta: contentMeta,
    setTouched: setContentTouched,
  } = useField("content");

  const { value: title } = useField("title", undefined, {
    initialValue: courseData.value.title,
  });

  const { value: level, errorMessage: levelError } = useField("level");
  const { value: type, errorMessage: typeError } = useField("type");
  const { value: startDate, errorMessage: startDateError } =
    useField("startDate");
  const { value: endDate, errorMessage: endDateError } = useField("endDate");

  const {
    value: imageUrl,
    setValue: setImageUrl,
    meta: metaImage,
    errorMessage: errorImage,
  } = useField("imageUrl");

  // Editor Setup
  const initEditor = async () => {
    editorInstance.value = new EditorJS({
      holder: "editorjs",
      placeholder: "Let's write an awesome story!",
      readOnly: false,
      autofocus: false,
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

  // Content Covered Setup
  const contentCovered = ref([]);
  const dialogVisible = ref(false);
  const dialogData = ref({});
  const dialogMode = ref("add-level");

  // Computed Properties for Dialog Modes
  const addLevelMode = computed(() => dialogMode.value === "add-level");
  const addCourseMode = computed(() => dialogMode.value === "add-course");
  const addSubContentMode = computed(
    () => dialogMode.value === "add-sub-content"
  );
  const editCourseMode = computed(() => dialogMode.value === "edit-course");
  const editSubContentMode = computed(
    () => dialogMode.value === "edit-sub-content"
  );

  // Menu Setup
  const menu = ref();
  const menuItems = ref([]);
  const levelMenu = ref();
  const levelMenuItems = ref([]);
  const courseMenu = ref();
  const courseMenuItems = ref([]);
  const deleteDialog = ref(false);
  const deleteData = ref(null);

  // Lifecycle Hooks
  onMounted(async () => {
    if (isUpdate.value) await getDetail();
    else initContentCovered();

    await initEditor();
  });

  onBeforeUnmount(() => {
    if (editorInstance.value) {
      editorInstance.value.destroy();
    }
  });

  // Watchers
  watch(title, (newTitle) => {
    courseData.value.title = newTitle;
    contentCovered.value[0].title = newTitle;
  });

  // Add new watcher for startDate
  watch(startDate, (newStartDate) => {
    // If endDate is before the new startDate, reset endDate
    if (endDate.value && newStartDate && endDate.value < newStartDate) {
      endDate.value = null;
    }
  });

  // Methods
  const getDetail = async () => {
    try {
      loading.value = true;
      const secureId = route.params?.secureId;

      const response = await courseService.details(secureId);

      const {
        data: { data: course, status },
      } = response;

      if (status == "success") {
        const fields = [
          "title",
          "description",
          "videoUrl",
          "imageUrl",
          "level",
          "type",
          "content",
        ];
        fields.forEach((field) => {
          setFieldValue(field, course?.[field] || "");
        });

        // Handle dates separately to ensure proper Date object conversion
        setFieldValue(
          "startDate",
          course?.startDate ? new Date(course.startDate) : null
        );
        setFieldValue(
          "endDate",
          course?.endDate ? new Date(course.endDate) : null
        );

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
          console.log("editorInstance.value", editorInstance.value);
          console.log("course?.content", course?.content);
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

  const initContentCovered = () => {
    contentCovered.value = [
      {
        level: 1,
        title: title.value,
        type: "PARENT",
        subContents: [],
      },
    ];
  };

  const onCancel = () => {
    router.replace({
      name: COURSE.LIST,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    // Convert dates to ISO strings for API submission
    // Check if contentCovered has required content
    if (!contentCovered.value[0]?.subContents?.length) {
      toast.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Please add at least one sub-content",
        life: 3000,
      });
      return;
    }

    // Check if any subContent has courses
    const hasAnyCourses = contentCovered.value[0].subContents.some(
      (subContent) => subContent.subCourses?.length > 0
    );

    if (!hasAnyCourses) {
      toast.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Please add at least one course to any sub-content",
        life: 3000,
      });
      return;
    }

    const payload = {
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
      contentCovered: contentCovered.value,
    };

    loadingSubmit.value = true;
    await courseService
      .create(payload)
      .then(({ data: { data: course, status } }) => {
        console.log({ status, id: course.id });
        if (status == "success") {
          toast.add({
            severity: "success",
            summary: "Success",
            detail: "Course created successfully",
            life: 3000,
          });

          router.replace({
            name: COURSE.DETAIL,
            params: {
              secureId: course.id,
            },
          });
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: course || "Failed to create course",
            life: 3000,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to create course",
          life: 3000,
        });
      })
      .finally(() => {
        loadingSubmit.value = false;
      });
  });

  const saveData = () => {
    onSubmit();
  };

  // Content Management Methods
  function addLevel() {
    dialogMode.value = "add-level";
    dialogVisible.value = true;
  }

  function addSubContent(levelIndex) {
    dialogMode.value = "add-sub-content";
    dialogData.value = {
      number: String(
        contentCovered.value[levelIndex].subContents.length + 1
      ).padStart(2, "0"),
      title: "",
      description: "",
      is_open: false,
      subCourses: [],
      levelIndex,
    };
    dialogVisible.value = true;
  }

  function addCourse(levelIndex, subContentIndex) {
    dialogMode.value = "add-course";
    dialogData.value = {
      subCourses: [
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
      contentCovered.value[levelIndex].subContents[subContentIndex].subCourses[
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
    contentCovered.value[levelIndex].subContents[
      subContentIndex
    ].subCourses.splice(courseIndex, 1);
  }

  function editSubContent(levelIndex, subContentIndex) {
    dialogMode.value = "edit-sub-content";
    const subContent =
      contentCovered.value[levelIndex].subContents[subContentIndex];
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
      contentCovered.value[dialogData.value.levelIndex].subContents[
        dialogData.value.subContentIndex
      ].subCourses.push({
        title: dialogData.value.title,
        description: dialogData.value.description,
        is_checked: false,
      });
    } else if (addSubContentMode.value) {
      contentCovered.value[dialogData.value.levelIndex].subContents.push({
        number: dialogData.value.number,
        title: dialogData.value.title,
        description: dialogData.value.description,
        is_open: false,
        subCourses: [],
      });
    } else if (editCourseMode.value) {
      const { levelIndex, subContentIndex, courseIndex, title, description } =
        dialogData.value;
      const course =
        contentCovered.value[levelIndex].subContents[subContentIndex]
          .subCourses[courseIndex];
      course.title = title;
      course.description = description;
    } else if (editSubContentMode.value) {
      const { levelIndex, subContentIndex, title, description } =
        dialogData.value;
      const subContent =
        contentCovered.value[levelIndex].subContents[subContentIndex];
      subContent.title = title;
      subContent.description = description;
    }
    dialogVisible.value = false;
  }

  const handleSelectedCourses = (courses) => {
    courses = {
      ...courses,
      courseId: courses.id,
      type: "CHILDREN",
      level: contentCovered.value.length + 1,
      image: courses.imageUrl,
      linked_course: "/course/" + courses.id,
    };
    contentCovered.value.push(courses);
    dialogMode.value = "add-course";
    dialogVisible.value = false;
  };

  function deleteSubContent(levelIndex, subContentIndex) {
    deleteDialog.value = true;
    deleteData.value = {
      type: "sub-content",
      levelIndex,
      subContentIndex,
      title:
        contentCovered.value[levelIndex].subContents[subContentIndex].title,
    };
  }

  function confirmDelete() {
    if (deleteData.value.type === "sub-content") {
      const { levelIndex, subContentIndex } = deleteData.value;
      contentCovered.value[levelIndex].subContents.splice(subContentIndex, 1);
      contentCovered.value[levelIndex].subContents.forEach(
        (subContent, index) => {
          subContent.number = String(index + 1).padStart(2, "0");
        }
      );
    } else if (deleteData.value.type === "level") {
      const { levelIndex } = deleteData.value;
      contentCovered.value.splice(levelIndex, 1);
      contentCovered.value.forEach((level, index) => {
        level.level = index + 1;
      });
    }
    deleteDialog.value = false;
    deleteData.value = null;
  }

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

  function showLevelMenu(event, levelIndex) {
    levelMenuItems.value = [
      {
        label: "Edit Course",
        icon: "pi pi-pencil",
        command: () => {
          editLevel(levelIndex);
        },
      },
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
    const secureId = contentCovered.value[levelIndex]?.id;

    if (!secureId) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Secure Id not found",
      });

      return;
    }

    window.open(`/course/update/${secureId}`, "_blank");
  }

  function deleteLevel(levelIndex) {
    deleteDialog.value = true;
    deleteData.value = {
      type: "level",
      levelIndex,
      title: contentCovered.value[levelIndex].title,
    };
  }

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
    if (addLevelMode.value) return "Add Level";
    if (addCourseMode.value) return "Add Course";
    if (addSubContentMode.value) return "Add Sub-Content";
    if (editCourseMode.value) return "Edit Course";
    if (editSubContentMode.value) return "Edit Sub-Content";
  });

  // Drag and Drop Methods
  const handleDragStart = (event, index) => {
    event.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, dropIndex) => {
    event.preventDefault();
    const dragIndex = parseInt(event.dataTransfer.getData("text/plain"));
    if (dragIndex !== dropIndex) {
      const item = contentCovered.value[dragIndex];
      contentCovered.value.splice(dragIndex, 1);
      contentCovered.value.splice(dropIndex, 0, item);
      contentCovered.value.forEach((level, index) => {
        level.level = index + 1;
      });
    }
  };

  const getListCourse = async (callback) => {
    try {
      const {
        data: { data, status },
      } = await courseService.list({
        page: 1,
        limit: 100,
      });

      if (status == "success") {
        callback(data);
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
    }
  };

  const onUpload = async (event) => {
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

  const onCancelImage = () => {
    setImageUrl(null);
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
    <div v-if="loading">
      <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
      <SkeletonCard />
    </div>
  </div>

  <template v-if="!loading">
    <div class="card mb-2">
      <p class="font-semibold text-2xl mb-8">
        {{ isUpdate ? "Update Course" : "Create Course" }}
      </p>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="title"
        />
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="courseData.description"
        />
        <div class="flex flex-col">
          <div class="mb-2">Image</div>
          <UploadImage
            :multiple="false"
            :uploadFn="onUpload"
            @cancelImage="onCancelImage"
          />
          <small v-if="!metaImage.valid" class="text-red-500">{{
            errorImage
          }}</small>
        </div>
        <div v-if="imageUrl" class="flex flex-col">
          <div class="mb-2">Image Preview</div>
          <img :src="imageUrl" alt="Image Preview" class="w-full" />
        </div>
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="videoUrl"
          label="Video URL"
          :values="courseData.videoUrl"
        />
        <div class="grid grid-cols-12 gap-4">
          <div class="flex flex-col col-span-6 gap-2">
            <label for="courseLevel">Level</label>
            <Select
              id="courseLevel"
              v-model="level"
              display="chip"
              :options="courseLevel"
              optionLabel="label"
              optionValue="value"
              filter
              placeholder="Select Course Level"
              class="w-full"
            />
            <small v-if="errors.level" class="text-red-500">{{
              errors.level
            }}</small>
          </div>
          <div class="flex flex-col col-span-6 gap-2">
            <label for="courseType">Type</label>
            <SelectButton
              id="courseType"
              v-model="type"
              :options="courseType"
              optionLabel="label"
              optionValue="value"
              filter
              placeholder="Select Course Type"
              class="w-full"
            />
            <small v-if="errors.type" class="text-red-500">{{
              errors.type
            }}</small>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="flex flex-col col-span-6 gap-2">
            <label for="startDate">Start Date</label>
            <Calendar
              id="startDate"
              v-model="startDate"
              dateFormat="dd/mm/yy"
              placeholder="Select Start Date"
              class="w-full"
              :showIcon="true"
              :minDate="new Date()"
              :manualInput="false"
            />
            <small v-if="errors.startDate" class="text-red-500">{{
              errors.startDate
            }}</small>
          </div>
          <div class="flex flex-col col-span-6 gap-2">
            <label for="endDate">End Date</label>
            <Calendar
              id="endDate"
              v-model="endDate"
              dateFormat="dd/mm/yy"
              placeholder="Select End Date"
              class="w-full"
              :showIcon="true"
              :minDate="startDate || new Date()"
              :disabled="!startDate"
              :manualInput="false"
            />
            <small v-if="errors.endDate" class="text-red-500">{{
              errors.endDate
            }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-2">
      <div class="col-span-8 card m-0">
        <p class="font-semibold text-2xl mb-8">About Course</p>
        <div class="editor-container">
          <div id="editorjs" class="editor-wrapper"></div>
          <small v-if="errors.content" class="text-red-500 mt-2">{{
            errors.content
          }}</small>
        </div>
      </div>
      <div class="col-span-4 card h-full">
        <p class="font-semibold text-2xl mb-8">Content Covered</p>
        <Accordion :multiple="true">
          <AccordionTab v-for="(level, lIdx) in contentCovered" :key="lIdx">
            <template #header>
              <div
                class="flex items-center justify-between w-full draggable-level"
                draggable="true"
                @dragstart="handleDragStart($event, lIdx)"
                @dragover.prevent="handleDragOver"
                @drop.stop="handleDrop($event, lIdx)"
              >
                <div class="flex items-center gap-4">
                  <i class="pi pi-bars text-gray-500"></i>
                  <span v-if="level.type == 'PARENT'">
                    Level {{ level.level }}: {{ level.title }}
                  </span>
                  <span v-else>
                    Level {{ level.level }}: {{ level.courses?.title }}
                  </span>
                </div>
                <div class="flex items-center gap-2 p-1">
                  <Button
                    v-if="level.type == 'CHILDREN'"
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
            <template v-if="level.type == 'CHILDREN'">
              <CardCourse :item="level" />
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
  </template>

  <!-- Dialog for Add/Edit -->
  <Dialog
    v-model:visible="dialogVisible"
    :header="handleDialogHeader"
    modal
    :style="{ width: '720px' }"
  >
    <!-- Form Section -->
    <div class="flex flex-col gap-4">
      <!-- For Level -->
      <template v-if="addLevelMode">
        <CardCourses
          @selected-courses="handleSelectedCourses"
          :fnMounted="getListCourse"
        />
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
      <template v-else-if="addSubContentMode || editSubContentMode">
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

  .draggable-level {
    cursor: grab;
    user-select: none;
  }

  .draggable-level:active {
    cursor: grabbing;
  }

  .draggable-level:hover {
    opacity: 0.8;
  }

  .draggable-level.dragging {
    opacity: 0.5;
    background-color: var(--surface-hover);
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
