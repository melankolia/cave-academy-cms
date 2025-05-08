<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { NEWS } from "@/router/constants";
  import NewsService from "@/service/NewsService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";

  const newsData = ref({
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
  const router = useRouter();
  const route = useRoute();
  const photo = ref(null);
  const video = ref(null);
  const thumbnail = ref(null);
  const username = ref("admin");
  const newsService = reactive(new NewsService());
  const loadingSubmit = ref(false);
  const loading = ref(false);
  const validateYoutubeError = ref(
    "Please enter your video url using youtube url"
  );

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

  const {
    setValue: setThumbnail,
    meta: metaThumbnail,
    errorMessage: errorThumbnail,
  } = useField("thumbnails");
  const {
    value: existingPhotos,
    setValue: setPhotos,
    meta: metaPhotos,
    errorMessage: errorPhotos,
  } = useField("photos");
  const { setValue: setVideoUrl } = useField("videoUrl");

  const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });

  const isUpdate = computed(() => {
    return route.params?.secureId;
  });
  const breadcrumbItems = ref([
    { label: "News List", url: "/news" },
    { label: "News " + (isUpdate.value ? "Update" : "Create") },
  ]);

  onMounted(async () => {
    if (!isUpdate.value) return;

    try {
      loading.value = true;
      const secureId = route.params?.secureId;

      const {
        data: { result, message },
      } = await newsService.details(secureId);
      if (message == "OK") {
        if (result.tagResponseVos.length > 0) {
          const tagResponseVos = result.tagResponseVos.map(
            (tagResponseVo) => tagResponseVo.name
          );
          result.tags = [...tagResponseVos];
        }

        result.photos =
          result.photoVos.length > 0 ? result.photoVos[0].photo : null;
        result.isVideo = !!result.videoUrl;
        result.videos = result.videoUrl;
        result.thumbnails = result.thumbnail;

        setThumbnail(result.thumbnail);
        setPhotos(result.photos);
        setVideoUrl(result.videos);

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
  });

  const setValueVideoUrl = (params) => {
    newsData.value.videoUrl = params;
    setVideoUrl(params);
  };

  const onUpload = async (event, type = "photo") => {
    if (event?.xhr?.status == 200) {
      try {
        const { result } = await JSON.parse(event.xhr.response);
        let photos = [];

        switch (type) {
          case "photo":
            photos = result.map((e) => e.path);

            if (existingPhotos.value)
              photos = [existingPhotos.value, ...photos];

            photos = photos.join(";");

            newsData.value.photos = photos;
            setPhotos(photos);
            break;
          case "thumbnail":
            newsData.value.thumbnails = result.thumbnailUri;
            setThumbnail(result.thumbnailUri);
            break;
          default:
            break;
        }

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
          detail: "Photos Upload Failed",
          life: 3000,
        });
      }
    }
  };

  const handlePhotosError = () => {
    photo.value.clear();
    toast.add({
      severity: "error",
      summary: "Upload Failed",
      detail: "Photos Upload Failed",
      life: 3000,
    });
  };

  const handlePhotoRemove = () => {
    newsData.value.photos = null;
  };

  const handleThumbnailsError = () => {
    video.value.clear();
    toast.add({
      severity: "error",
      summary: "Upload Failed",
      detail: "Thumbnails Upload Failed",
      life: 3000,
    });
  };

  const handleThumbnailRemove = () => {
    newsData.value.thumbnails = null;
  };

  const onCancel = () => {
    router.replace({
      name: NEWS.LIST,
    });
  };

  const saveData = handleSubmit(async (values) => {
    try {
      loadingSubmit.value = true;
      const payload = {
        title: values?.title,
        description: values?.description,
        videoUrl: values?.videoUrl,
        isVideo: values?.isVideo,
        tags: values?.tags?.join(","),
        photos: values?.photos,
        thumbnail: values?.thumbnails,
        content: values?.content,
      };

      let type = "create";
      if (isUpdate.value) type = "update";

      const secureId = newsData.value?.secureId;

      const {
        data: { result, message },
      } = await newsService[type](payload, secureId);

      if (message == "OK") {
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "News " + isUpdate.value ? "Updated" : "Created",
          life: 3000,
        });
        router.replace({
          name: NEWS.DETAIL,
          params: {
            secureId: result.secureId,
          },
        });
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: "News " + (isUpdate.value ? "Updated" : "Created") + "Failed",
        life: 3000,
      });
    } finally {
      loadingSubmit.value = false;
    }
  });

  const setErrorYoutubeUrl = (cb) => {
    newsData.value.isVideo = false;
    newsData.value.videoUrl = null;
    setVideoUrl(null);

    cb && cb();
  };

  const isYoutubeURL = computed(
    () => validateYoutubeError.value == "This is a youtube link"
  );

  const validateYoutubeUrl = (params = "") => {
    if (!params) {
      setErrorYoutubeUrl(
        () =>
          (validateYoutubeError.value =
            "Please enter your video url using youtube url")
      );
      return;
    }

    const youtubeEmbedTemplate = "https://www.youtube.com/embed/";
    const url = params.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    const YId =
      undefined !== url[2] ? url[2].split(/[^0-9a-z_/\\-]/i)[0] : url[0];

    console.log(YId === url[0]);

    if (YId === url[0]) {
      setErrorYoutubeUrl(
        () =>
          (validateYoutubeError.value =
            "This is not a youtube link, Please enter your youtube url")
      );
      return;
    }

    validateYoutubeError.value = "This is a youtube link.";
    newsData.value.isVideo = true;
    newsData.value.videoUrl = youtubeEmbedTemplate.concat(YId);
    setVideoUrl(youtubeEmbedTemplate.concat(YId));
  };

  watch(
    () => newsData.value.videoUrl,
    (newVal) => {
      if (newVal) validateYoutubeUrl(newVal);
    },
    { deep: true }
  );
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
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="newsData.description"
        />
        <FieldAutoComplete
          className="flex flex-col"
          name="tags"
          :values="newsData.tags"
        />
        <div class="flex flex-col">
          <div class="mb-2">Photo's</div>
          <FileUpload
            @error="handlePhotosError"
            :url="`/micro-api/image/upload?username=${username}`"
            ref="photo"
            name="photos"
            @upload="onUpload($event, 'photo')"
            accept="image/*"
            @clear="handlePhotoRemove"
            @remove="handlePhotoRemove"
            :maxFileSize="1000000"
          />
          <small v-if="!metaPhotos.valid" class="text-red-500">{{
            errorPhotos
          }}</small>
        </div>

        <div class="flex flex-col">
          <div class="flex flex-col flex-wrap gap-2 w-full">
            <label for="video">Video Url</label>
            <InputText
              id="video"
              type="text"
              :model-value="newsData.videoUrl"
              @update:model-value="setValueVideoUrl"
            />
            <small
              :class="{ 'text-green-600': isYoutubeURL }"
              id="video-help"
              >{{ validateYoutubeError }}</small
            >
          </div>
        </div>
        <div class="flex flex-col">
          <div class="mb-2">Thumbnail</div>
          <FileUpload
            @error="handleThumbnailsError"
            :url="`/micro-api/thumbnail/upload?username=${username}`"
            ref="thumbnail"
            name="thumbnails"
            @upload="onUpload($event, 'thumbnail')"
            accept="image/*"
            @clear="handleThumbnailRemove"
            @remove="handleThumbnailRemove"
            :maxFileSize="1000000"
          />
          <small v-if="!metaThumbnail.valid" class="text-red-500">{{
            errorThumbnail
          }}</small>
        </div>
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="content"
          label="Content"
          :values="newsData.content"
          rows="8"
        />
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
    </template>
  </div>
</template>
