<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { EVENT } from "@/router/constants";
  import EventService from "@/service/EventService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import {
    computed,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    watch,
  } from "vue";
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

  const eventData = ref({
    title: "",
    content: "",
    imageUrl: "",
    description: "",
    level: "",
    type: "",
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

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const eventService = reactive(new EventService());
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
      level: zod.string().min(1, { message: "Level is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
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
    })
  );

  const { handleSubmit, errors } = useForm({
    validationSchema,
    initialValues: {
      title: eventData.value.title,
      description: eventData.value.description,
      level: eventData.value.level,
      type: eventData.value.type,
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

  const {
    value: imageUrl,
    setValue: setImageUrl,
    meta: metaImage,
    errorMessage: errorImage,
  } = useField("imageUrl");

  const {
    value: level,
    errorMessage: levelError,
    setValue: setLevel,
  } = useField("level");
  const {
    value: type,
    errorMessage: typeError,
    setValue: setType,
  } = useField("type");
  const {
    value: startDate,
    errorMessage: startDateError,
    setValue: setStartDate,
  } = useField("startDate");

  const {
    value: endDate,
    errorMessage: endDateError,
    setValue: setEndDate,
  } = useField("endDate");

  const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });

  const isUpdate = computed(() => {
    return route.params?.secureId;
  });

  const breadcrumbItems = ref([
    { label: "Event List", url: "/event" },
    { label: "Event " + (isUpdate.value ? "Update" : "Create") },
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
      data: eventData.value.content ? JSON.parse(eventData.value.content) : {},
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

      const { data } = await eventService.details(id);
      if (data.status === "success") {
        const result = data.data;
        setImageUrl(result.imageUrl);
        setLevel(result.level);
        setType(result.isOnline ? "online" : "offline");
        setStartDate(result.startDate ? new Date(result.startDate) : null);
        setEndDate(result.endDate ? new Date(result.endDate) : null);

        eventData.value = result;
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

  // Add new watcher for startDate
  watch(startDate, (newStartDate) => {
    // If endDate is before the new startDate, reset endDate
    if (endDate.value && newStartDate && endDate.value < newStartDate) {
      endDate.value = null;
    }
  });

  const onUpload = async (event) => {
    if (event?.xhr?.status == 200) {
      try {
        const { result } = await JSON.parse(event.xhr.response);
        eventData.value.imageUrl = result.imageUrl;
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
    eventData.value.imageUrl = null;
    setImageUrl(null);
  };

  const onCancel = () => {
    router.replace({
      name: EVENT.LIST,
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
        level: values?.level,
        isOnline: values?.type?.toLowerCase() === "online",
        startDate: values?.startDate,
        endDate: values?.endDate,
      };

      let type = "create";
      if (isUpdate.value) type = "update";

      const id = eventData.value?.id;

      const {
        data: { data, status },
      } = await eventService[type](payload, id);

      if (status === "success") {
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: `Event ${isUpdate.value ? "Updated" : "Created"}`,
          life: 3000,
        });
        router.replace({
          name: EVENT.DETAIL,
          params: {
            secureId: data.id,
          },
        });
      } else {
        throw new Error(`Event ${isUpdate.value ? "Update" : "Create"} Failed`);
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
  </div>

  <div v-if="loading">
    <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
    <SkeletonCard />
  </div>
  <template v-else>
    <div class="card mb-2">
      <div class="font-semibold text-2xl mb-8">
        {{ isUpdate ? "Update" : "Create" }} Event
      </div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="eventData.title"
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
              <div v-if="eventData.imageUrl" class="flex items-center flex-col">
                <img
                  :src="eventData.imageUrl"
                  :alt="eventData.title"
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
          :values="eventData.description"
          rows="8"
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

    <div class="card surface-ground py-5 mt-4">
      <div class="flex flex-col">
        <div class="mb-2">Content</div>
        <div id="editorjs" class="editor-wrapper"></div>
        <small v-if="contentError" class="text-red-500">{{
          contentError
        }}</small>
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
            label="Save Event"
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
