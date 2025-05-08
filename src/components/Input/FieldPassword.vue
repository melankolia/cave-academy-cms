<script setup>
  import { useField } from "vee-validate";

  const props = defineProps({
    name: String,
    label: String,
    type: String,
    values: String,
    className: String,
    placeHolder: String,
  });

  const { value, errorMessage, meta } = useField(() => props.name, undefined, {
    initialValue: props.values,
  });
</script>

<template>
  <div :class="className">
    <label :for="props.name">{{ label }}</label>
    <Password
      :id="props.name"
      type="password"
      v-model="value"
      :placeholder="placeHolder"
      :toggleMask="true"
      fluid
      :feedback="false"
      :invalid="meta.touched && !meta.valid"
    />
    <small v-if="meta.touched && !meta.valid" class="text-red-500">{{
      errorMessage
    }}</small>
  </div>
</template>
