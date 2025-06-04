<template>
  <div
    :key="item.id"
    class="flex flex-col sm:flex-row sm:items-center p-2.5 gap-4 hover:bg-green-950 transition-colors duration-200 cursor-pointer"
    @click="handleClick"
  >
    <div class="md:w-40 relative mr-2.5">
      <img
        class="block xl:block mx-auto rounded w-full hover:opacity-90 transition-opacity duration-200"
        :src="item.imageUrl"
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
  import { computed, watch, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";

  const router = useRouter();
  const route = useRoute();
  const props = defineProps({
    item: {
      type: Object,
      required: true,
      default: () => ({
        id: "",
        imageUrl: "",
        title: "",
        description: "",
        startDate: "",
        endDate: "",
      }),
    },
  });

  onMounted(() => {
    console.log(props.item);
  });

  const date = computed(() => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    return `${formatDate(props.item.startDate)} - ${formatDate(props.item.endDate)}`;
  });

  watch(
    () => route.params.secureId,
    (newId) => {
      if (newId) router.go(0);
    }
  );

  const handleClick = () => {
    router.push(`/course/${props.item.id}`);
  };
</script>
