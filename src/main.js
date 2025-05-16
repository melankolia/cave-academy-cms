import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";

import "@/assets/styles.scss";
import "@/assets/tailwind.css";

async function prepareApp() {
  if (import.meta.env.MODE === "development" || import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");

    return worker.start();
  }

  return Promise.resolve();
}

prepareApp().then(() => {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  const app = createApp(App);

  // Add app-dark class to root element for dark mode
  document.documentElement.classList.add("app-dark");

  app.use(pinia);
  app.use(autoAnimatePlugin);
  app.use(router);
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      dark: true,
      options: {
        darkModeSelector: ".app-dark",
      },
    },
  });
  app.use(ToastService);
  app.use(ConfirmationService);

  app.mount("#app");
});
