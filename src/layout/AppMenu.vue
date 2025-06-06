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
          label: "Sales Management",
          icon: "pi pi-fw pi-users",
          to: "/sales-management",
        },
        {
          label: "Product",
          icon: "pi pi-fw pi-box",
          items: [
            {
              label: "Master",
              to: "/product-master",
            },
            {
              label: "Stock Management",
              to: "/product-management",
            },
          ],
        },
        {
          label: "Visitation",
          icon: "pi pi-fw pi-map-marker",
          to: "/visitation",
        },
        {
          label: "Course",
          icon: "pi pi-fw pi-book",
          to: "/course",
        },
        // { label: "Boards", icon: "pi pi-fw pi-sitemap", to: "/board" },
        { label: "News", icon: "pi pi-fw pi-megaphone", to: "/news" },
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
