<script setup>
  import { ref, computed } from "vue";
  import pdfIcon from "@/assets/pdf.png";

  const props = defineProps({
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    uploadFn: {
      type: Function,
      required: true,
    },
  });

  const loadingUpload = ref(false);
  const fileInput = ref(null);
  const isDragOver = ref(false);
  const files = ref([]);

  const chooseFile = () => {
    fileInput.value.click();
  };

  const handleUpload = async () => {
    try {
      loadingUpload.value = true;
      await uploadFn();
    } catch (error) {
      console.error(error);
    } finally {
      loadingUpload.value = false;
    }
  };

  const handleCancel = () => {
    files.value = [];
  };

  const handleFileChange = (event, type) => {
    if (type == "onDrop") {
      if (guardMultiple.value) return;

      return (files.value = [...files.value, event.dataTransfer.files[0]]);
    }

    return (files.value = [...files.value, event.target.files[0]]);
  };

  const onDragOver = () => {
    isDragOver.value = true;
  };

  const onDragLeave = () => {
    isDragOver.value = false;
  };

  const onDrop = (event) => {
    isDragOver.value = false;
    validateAndProcessFile(event);
  };

  const validateAndProcessFile = (event) => {
    const file = event.dataTransfer.files[0];

    if (!file) return;

    const fileExtension = file.type;
    if (
      ["image/png", "image/jpeg", "image/gif", "application/pdf"].includes(
        fileExtension
      )
    )
      return handleFileChange(event, "onDrop");

    alert("Only images and PDF files are allowed!");
  };

  const objectToUrl = (file) => {
    if (["application/pdf"].includes(file.type)) {
      return pdfIcon;
    }
    return URL.createObjectURL(file);
  };

  const handleOpenImage = (file) => {
    const url = objectToUrl(file);
    window.open(url, "_blank");
  };

  const fileSizeInKB = (fileSizeInBytes) => {
    return (fileSizeInBytes / 1024).toFixed(2) + " KB";
  };

  const handleRemove = (index) => {
    files.value = [...files.value.filter((_, i) => i !== index)];
  };

  const isFileAvail = computed(() => files.value.length > 0);
  const guardMultiple = computed(() => {
    if (!props.multiple && files.value.length >= 1) return true;
  });
</script>

<template>
  <div
    class="drop-zone flex flex-col border border-[#d0d4da] rounded-xl p-6"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'is-dragover': isDragOver }"
  >
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept="image/*,application/pdf"
      @change="handleFileChange"
    />
    <div class="flex flex-row gap-4 mb-2 grid-cols-12">
      <Button
        label="Choose"
        icon="pi pi-plus"
        @click="chooseFile"
        :disabled="loadingUpload || guardMultiple"
      />
      <Button
        label="Upload"
        icon="pi pi-upload"
        @click="handleUpload"
        :disabled="loadingUpload"
      />
      <Button
        :disabled="!isFileAvail"
        label="Cancel"
        icon="pi pi-times"
        severity="danger"
        @click="handleCancel"
      />
    </div>
    <ProgressBar
      v-if="loadingUpload"
      mode="indeterminate"
      style="height: 4px"
    />
    <p v-if="!isFileAvail" class="mt-8">
      Drag and drop files to here to upload.
    </p>
    <div
      v-for="(file, index) in files"
      :key="file.name"
      class="flex flex-col gap-8 mt-4"
    >
      <div class="flex flex-row justify-between gap-8">
        <div class="flex flex-row gap-8">
          <img
            :src="objectToUrl(file)"
            class="w-[50px] shrink-0 hover:cursor-pointer"
            alt="Preview File"
            @click="handleOpenImage(file)"
          />
          <div class="flex flex-col">
            <p>{{ file.name }}</p>
            <p>{{ fileSizeInKB(file.size) }}</p>
          </div>
        </div>
        <Button
          icon="pi pi-times"
          text
          severity="danger"
          @click="() => handleRemove(index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .drop-zone {
    transition: background-color 0.3s ease;
  }

  .drop-zone.is-dragover {
    background-color: #f0f8ff;
  }
</style>
