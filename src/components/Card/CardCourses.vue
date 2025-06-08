<template>
  <div>
    <DataTable
      :value="courses"
      tableStyle="min-width: 50rem"
      selectionMode="single"
      v-model:selection="selectedCourse"
      @row-click="handleRowClick"
      dataKey="id"
      :rowClass="getRowClass"
    >
      <Column header="Image">
        <template #body="slotProps">
          <img
            :src="slotProps.data.imageUrl"
            :alt="slotProps.data.imageUrl"
            class="w-24 rounded"
          />
        </template>
      </Column>
      <Column field="title" header="Title">
        <template #body="slotProps">
          <span class="line-clamp-2">{{ slotProps.data.title }}</span>
        </template>
      </Column>
      <Column field="description" header="Description">
        <template #body="slotProps">
          <span class="line-clamp-2 max-w-[400px]">{{
            slotProps.data.description
          }}</span>
        </template>
      </Column>
      <Column header="Date">
        <template #body="slotProps">
          {{
            formatDateRange(slotProps.data.startDate, slotProps.data.endDate)
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from "vue";

  const props = defineProps({
    fnMounted: {
      type: Function,
      required: true,
    },
  });

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";
    const startDateFormatted = startDate
      ? new Date(startDate).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";
    const endDateFormatted = endDate
      ? new Date(endDate).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";
    return `${startDateFormatted} - ${endDateFormatted}`;
  };

  const selectedCourse = ref(null);
  const coveredCourses = ref(null);

  const handleRowClick = (event) => {
    const courseId = event.data.id;
    coveredCourses.value = courseId;
  };

  const getRowClass = (data) => {
    return {
      "bg-green-100": coveredCourses.value === data.id,
      "cursor-pointer": true,
      "hover:bg-gray-50": coveredCourses.value !== data.id,
    };
  };

  const courses = ref([]);

  const emit = defineEmits(["selectedCourses"]);

  onMounted(() => {
    props.fnMounted((items) => {
      courses.value = [...items];
    });
  });

  watch(
    () => coveredCourses.value,
    (newCourses) => {
      const selectedCourses = courses.value.find(
        (course) => course.id === newCourses
      );

      emit("selectedCourses", selectedCourses);
    },
    { deep: true }
  );
</script>

<style lang="scss" scoped>
  .bg-green-100 {
    background-color: rgb(220, 252, 231);
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .hover\:bg-gray-50:hover {
    background-color: rgb(249, 250, 251);
  }
</style>
