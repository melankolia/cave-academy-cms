<script setup>
import { useLayout } from '@/layout/composables/layout';
import { LOGIN } from '@/router/constants';
import { useAuthStore } from '@/store/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const store = useAuthStore();
const router = useRouter();

const menu = ref(null);

const overlayMenuItems = ref([
    {
        separator: true
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => handleLogout()
    }
]);

const handleLogout = async () => {
    store.logout();
    router.replace({ name: LOGIN });
};
function toggleMenu(event) {
    menu.value.toggle(event);
}
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img class="w-12 shrink-0 mx-auto" src="@/assets/cms-logo.png" alt="cms logo" />
                <!-- <span>Content Management System</span> -->
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <Menu ref="menu" :model="overlayMenuItems" :popup="true">
                <template #start>
                    <div class="flex flex-row px-4 py-2 my-1">
                        <Avatar icon="pi pi-user" class="mr-3" size="large" shape="circle" />
                        <div class="flex flex-col justify-center">
                            <p class="text-sm text-gray-500">{{ store.role }}</p>
                            <p class="font-bold">{{ store.username }}</p>
                        </div>
                    </div>
                </template>
            </Menu>
            <Button class="layout-topbar-action" text label="Options" icon="pi pi-angle-down" @click="toggleMenu" style="width: auto">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </Button>
        </div>
    </div>
</template>
