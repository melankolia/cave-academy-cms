<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center p-2.5 gap-4 hover:bg-green-950 transition-colors duration-200 cursor-pointer"
  >
    <div class="md:w-40 relative mr-2.5">
      <img
        class="block xl:block mx-auto rounded w-full hover:opacity-90 transition-opacity duration-200"
        :src="item.image"
        :alt="item.title"
      />
    </div>
    <div
      class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6"
    >
      <div class="flex flex-row md:flex-col justify-between items-start gap-2">
        <div>
          <span
            class="font-medium text-surface-500 dark:text-surface-400 text-sm hover:text-primary-500 transition-colors duration-200"
          >
            {{ item.title }}
          </span>
          <div
            class="text-sm text-surface-500 dark:text-surface-400 font-medium mt-2 transition-colors duration-200"
          >
            {{ date }}
          </div>
          <div
            class="text-lg font-medium mt-2 transition-colors duration-200 line-clamp-2"
          >
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { computed } from "vue";

  const props = defineProps({
    item: {
      type: Object,
      required: true,
      default: () => ({
        image: "https://picsum.photos/160/90",
        title: "Course 1",
        description: "Description 1",
        date: ["01/01/2024", "01/02/2024"],
      }),
    },
  });

  const date = computed(() => {
    return props.item.date?.[0] + " - " + props.item.date?.[1];
  });
</script>
