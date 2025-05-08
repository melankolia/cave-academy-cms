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
    />
    <small v-if="meta.touched && !meta.valid" class="text-red-500">{{
      errorMessage
    }}</small>
  </div>
</template>
