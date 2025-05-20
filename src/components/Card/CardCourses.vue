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
            :src="slotProps.data.image"
            :alt="slotProps.data.image"
            class="w-24 rounded"
          />
        </template>
      </Column>
      <Column field="title" header="Title"></Column>
      <Column field="description" header="Description"></Column>
      <Column header="Date">
        <template #body="slotProps">
          {{ formatDateRange(slotProps.data.date) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
  import { ref, watch } from "vue";

  const formatDateRange = (dateRange) => {
    if (!dateRange) return "-";
    const startDate = dateRange[0]
      ? new Date(dateRange[0]).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";
    const endDate = dateRange[1]
      ? new Date(dateRange[1]).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";
    return `${startDate} - ${endDate}`;
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

  const courses = ref([
    {
      id: 0,
      image: "https://picsum.photos/160/90",
      title: "Course 1",
      description: "Description 1",
      date: ["01/01/2024", "01/02/2024"],
    },
    {
      id: 1,
      image: "https://picsum.photos/160/90",
      title: "Course 2",
      description: "Description 2",
      date: ["01/01/2024", "01/02/2024"],
    },
  ]);

  const emit = defineEmits(["selectedCourses"]);

  watch(
    () => coveredCourses.value,
    (newCourses) => {
      const selectedCourses = courses.value[newCourses];

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
