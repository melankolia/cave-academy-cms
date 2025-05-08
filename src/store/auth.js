import AuthService from "@/service/AuthService";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref(null);
    const userId = ref(null);
    const role = ref(null);
    const name = ref(null);
    const username = ref(null);
    const isAuthenticated = computed(() => !!username.value);

    async function login(payload) {
      return new Promise((resolve, reject) => {
        const authService = new AuthService();
        authService
          .login(payload)
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            console.error(error);
            reject("Failed Login to the system");
          });
      });
    }

    async function logout() {
      const authService = new AuthService();

      return new Promise((resolve) => {
        authService
          .logout()
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            console.error(error);
            // reject('Failed Login to the system');
            forceLogout();
          });
      });
    }

    async function forceLogout() {
      return new Promise((resolve) => {
        username.value = null;
        role.value = null;
        token.value = null;

        resolve(true);
      });
    }

    const getRole = computed(() => {
      return role.value?.toUpperCase();
    });

    return {
      isAuthenticated,
      token,
      userId,
      role,
      name,
      username,
      getRole,
      login,
      logout,
      forceLogout,
    };
  },
  {
    persist: true,
    storage: sessionStorage,
  }
);
