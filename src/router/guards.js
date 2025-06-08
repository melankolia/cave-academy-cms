import { useAuthStore } from "@/store/auth";

export const roleGuard = (allowedRoles) => {
  return (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }

    const userRole = authStore.getRole?.toUpperCase();

    if (!allowedRoles.includes(userRole)) {
      return next({ name: "access-denied" });
    }

    return next();
  };
};
