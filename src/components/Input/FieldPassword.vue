<script setup>
  import { useField } from "vee-validate";

  const props = defineProps({
    name: String,
    label: String,
    type: String,
    values: String,
    className: String,
    placeHolder: String,
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
    initialValue: props.values,
  });
</script>

<template>
  <div :class="className">
    <label :for="props.name">{{ label }}</label>
    <Password
      :disabled="props.disabled"
      :readonly="props.readOnly"
      :id="props.name"
      type="password"
      v-model="value"
      :placeholder="placeHolder"
      :toggleMask="true"
      fluid
      :feedback="false"
      :invalid="meta.touched && !meta.valid"
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
