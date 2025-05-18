import AppLayout from "@/layout/AppLayout.vue";
import { useAuthStore } from "@/store/auth";
import { createRouter, createWebHistory } from "vue-router";
import {
  BOARD,
  SALES_MANAGEMENT,
  DASHBOARD,
  LOGIN,
  NEWS,
  PRODUCT,
  PRODUCT_STOCK,
  VISITATION,
  COURSE,
} from "./constants";
import { roleGuard } from "./guards";
import { ADMIN } from "./roles";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      meta: {
        authorization: true,
      },
      children: [
        {
          path: "/",
          name: DASHBOARD.LIST,
          component: () => import("@/views/Dashboard.vue"),
        },
        {
          path: "/sales-management",
          children: [
            {
              path: "",
              name: SALES_MANAGEMENT.LIST,
              component: () =>
                import("@/views/pages/sales-management/index.vue"),
            },
          ],
        },
        {
          path: "/product-master",
          children: [
            {
              path: "",
              name: PRODUCT.LIST,
              component: () =>
                import("@/views/pages/product/product-master/index.vue"),
            },
          ],
        },
        {
          path: "/product-management",
          children: [
            {
              path: "",
              name: PRODUCT_STOCK.LIST,
              component: () =>
                import("@/views/pages/product/product-stock/index.vue"),
            },
          ],
        },
        {
          path: "/board",
          name: BOARD.LIST,
          component: () => import("@/views/pages/board/index.vue"),
        },
        {
          path: "/news",
          children: [
            {
              path: "",
              name: NEWS.LIST,
              component: () => import("@/views/pages/news/index.vue"),
            },
            {
              path: "create",
              name: NEWS.CREATE,
              component: () => import("@/views/pages/news/create.vue"),
            },
            {
              path: "update/:secureId",
              name: NEWS.UPDATE,
              component: () => import("@/views/pages/news/create.vue"),
            },
            {
              path: ":secureId",
              name: NEWS.DETAIL,
              component: () => import("@/views/pages/news/detail.vue"),
            },
          ],
        },
        {
          path: "/visitation",
          children: [
            {
              path: "",
              name: VISITATION.LIST,
              component: () => import("@/views/pages/visitation/index.vue"),
              beforeEnter: roleGuard([ADMIN]),
            },
            {
              path: ":id",
              name: VISITATION.DETAIL,
              component: () => import("@/views/pages/visitation/detail.vue"),
              beforeEnter: roleGuard([ADMIN]),
            },
          ],
        },
        {
          path: "/course",
          children: [
            {
              path: "",
              name: COURSE.LIST,
              component: () => import("@/views/pages/course/index.vue"),
            },
            {
              path: "create",
              name: COURSE.CREATE,
              component: () => import("@/views/pages/course/create.vue"),
            },
            {
              path: "update/:secureId",
              name: COURSE.UPDATE,
              component: () => import("@/views/pages/course/create.vue"),
            },
            {
              path: ":secureId",
              name: COURSE.DETAIL,
              component: () => import("@/views/pages/course/detail.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/auth/login",
      name: LOGIN,
      component: () => import("@/views/pages/auth/Login.vue"),
    },
    {
      path: "/access-denied",
      name: "access-denied",
      component: () => import("@/views/pages/auth/Access.vue"),
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta?.authorization) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      return {
        name: "login",
        query: { redirect: to.fullPath },
      };
    }
  }

  if (!to.matched.length) {
    return { path: "/" };
  }
});

export default router;
