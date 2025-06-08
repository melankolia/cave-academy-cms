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
  EVENT,
  WIKI,
  STUDENT_MANAGEMENT,
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
          path: "/student-management",
          children: [
            {
              path: "",
              name: STUDENT_MANAGEMENT.LIST,
              component: () =>
                import("@/views/pages/student-management/index.vue"),
            },
            {
              path: "create",
              name: STUDENT_MANAGEMENT.CREATE,
              component: () =>
                import("@/views/pages/student-management/create.vue"),
            },
            {
              path: "update/:secureId",
              name: STUDENT_MANAGEMENT.UPDATE,
              component: () =>
                import("@/views/pages/student-management/create.vue"),
            },
            {
              path: ":secureId",
              name: STUDENT_MANAGEMENT.DETAIL,
              component: () =>
                import("@/views/pages/student-management/detail.vue"),
            },
          ],
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
        {
          path: "/event",
          children: [
            {
              path: "",
              name: EVENT.LIST,
              component: () => import("@/views/pages/event/index.vue"),
            },
            {
              path: "create",
              name: EVENT.CREATE,
              component: () => import("@/views/pages/event/create.vue"),
            },
            {
              path: "update/:secureId",
              name: EVENT.UPDATE,
              component: () => import("@/views/pages/event/create.vue"),
            },
            {
              path: ":secureId",
              name: EVENT.DETAIL,
              component: () => import("@/views/pages/event/detail.vue"),
            },
          ],
        },
        {
          path: "/wiki",
          children: [
            {
              path: "",
              name: WIKI.LIST,
              component: () => import("@/views/pages/wiki/index.vue"),
            },
            {
              path: "create",
              name: WIKI.CREATE,
              component: () => import("@/views/pages/wiki/create.vue"),
            },
            {
              path: "update/:secureId",
              name: WIKI.UPDATE,
              component: () => import("@/views/pages/wiki/create.vue"),
            },
            {
              path: ":secureId",
              name: WIKI.DETAIL,
              component: () => import("@/views/pages/wiki/detail.vue"),
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
