<script setup>
  import { ref } from "vue";

  import AppMenuItem from "./AppMenuItem.vue";

  const model = ref([
    {
      label: "Home",
      items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
    },
    {
      label: "Content Management System",
      items: [
        {
          label: "Student Management",
          icon: "pi pi-fw pi-users",
          to: "/student-management",
        },
        {
          label: "Course",
          icon: "pi pi-fw pi-book",
          to: "/course",
        },
        // { label: "Boards", icon: "pi pi-fw pi-sitemap", to: "/board" },
        { label: "News", icon: "pi pi-fw pi-megaphone", to: "/news" },
        { label: "Event", icon: "pi pi-fw pi-calendar", to: "/event" },
        { label: "Wiki", icon: "pi pi-fw pi-file-edit", to: "/wiki" },
      ],
    },
  ]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item
        v-if="!item.separator"
        :item="item"
        :index="i"
      ></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
