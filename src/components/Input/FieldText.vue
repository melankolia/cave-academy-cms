<script setup>
  import { useField } from "vee-validate";

  const props = defineProps({
    name: String,
    label: String,
    type: String,
    values: [String, Number],
    className: String,
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

  const handleReadOnly = (e) => {
    const isCopyShortcut =
      (e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "a");

    if (props.readOnly && !isCopyShortcut) {
      e.preventDefault();
    }
  };
</script>

<template>
  <div :class="className">
    <label :for="props.name">{{ label }}</label>
    <InputText
      :disabled="props.disabled"
      :readonly="props.readOnly"
      :id="props.name"
      v-model="value"
      required="true"
      autofocus
      :invalid="!props.disabled && meta.touched && !meta.valid"
      fluid
      @keydown="handleReadOnly"
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
  :deep(.readonly-input.p-inputtext:enabled:focus) {
    box-shadow: none;
    border-color: #ced4da;
  }
</style>
