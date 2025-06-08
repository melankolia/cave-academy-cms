<script setup>
  import { useField } from "vee-validate";
  import { computed } from "vue";

  const props = defineProps({
    name: String,
    type: String,
    values: String,
    className: {
      type: String,
      default: "",
    },
    rows: {
      type: String,
      default: "4",
    },
    placeholder: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  });

  const { value, errorMessage, meta } = useField(() => props.name, undefined, {
    validateOnMount: false,
    initialValue: props.values,
  });

  const name = computed(() => {
    if (!props.name) return "";
    return props.name.charAt(0).toUpperCase() + props.name.slice(1);
  });
</script>

<template>
  <div :class="props.className">
    <label :for="props.name">{{ name }}</label>
    <Textarea
      :id="props.name"
      v-model="value"
      required="true"
      autofocus
      :rows="props.rows"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readOnly"
      :class="[
        { 'border-gray-300': props.readOnly },
        { 'readonly-input': props.readOnly },
      ]"
    />
    <small v-if="meta.touched && !meta.valid" class="text-red-500">{{
      errorMessage
    }}</small>
  </div>
</template>

<style scoped>
  :deep(.readonly-input.p-textarea:enabled:focus) {
    box-shadow: none;
    border-color: #ced4da;
  }
</style>
