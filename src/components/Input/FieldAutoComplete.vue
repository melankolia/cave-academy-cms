<script setup>
  import { useField } from "vee-validate";
  import { computed } from "vue";

  const props = defineProps({
    name: String,
    type: String,
    values: String,
    className: String,
    rows: {
      type: String,
      default: "4",
    },
  });

  const { value, errorMessage, meta } = useField(() => props.name, undefined, {
    initialValue: props.values,
  });

  const name = computed(() => {
    if (!props.name) return "";
    return props.name.charAt(0).toUpperCase() + props.name.slice(1);
  });
</script>

<template>
  <div :class="className">
    <div class="mb-2">{{ name }}</div>
    <AutoComplete
      v-model="value"
      inputId="tags"
      multiple
      fluid
      :typeahead="false"
    />
    <small v-if="meta.touched && !meta.valid" class="text-red-500">{{
      errorMessage
    }}</small>
  </div>
</template>
