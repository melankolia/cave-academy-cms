<script setup>
  import { useField } from "vee-validate";

  const props = defineProps({
    name: String,
    label: String,
    type: String,
    values: [Number, null],
    className: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const { value, errorMessage, meta } = useField(() => props.name, undefined, {
    validateOnMount: false,
    initialValue: props.values,
  });
</script>

<template>
  <div :class="className">
    <label :for="props.name">{{ label }}</label>
    <InputNumber
      :disabled="props.disabled"
      :id="props.name"
      v-model="value"
      required="true"
      autofocus
      :invalid="!props.disabled && meta.touched && !meta.valid"
      fluid
    />
    <small v-if="meta.touched && !meta.valid" class="text-red-500">{{
      errorMessage
    }}</small>
  </div>
</template>
