<script setup>
import NewsService from '@/service/NewsService';

import { NEWS } from '@/router/constants';
import { useAuthStore } from '@/store/auth';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const store = useAuthStore();

// News Section
const newsService = reactive(new NewsService());
const news = ref([]);
const loadingNews = ref(false);
const options = ref({
    rowsPage: 5,
    currentPage: 0
});
const totalRecords = ref(0);

const getNewsList = async () => {
    try {
        loadingNews.value = true;
        const {
            data: {
                result: { listData, totalElements },
                message
            }
        } = await newsService.list({
            page: options.value.currentPage,
            limit: options.value.rowsPage
        });
        if (message == 'OK') {
            listData.map((e, id) => {
                e.id = id;
            });
            news.value = [...listData];
            totalRecords.value = totalElements;
        } else {
            throw new Error('Failed to fetch data!');
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch news data!', life: 3000 });
    } finally {
        loadingNews.value = false;
    }
};

const handleNewsDetail = (item) => {
    router.push({
        name: NEWS.DETAIL,
        params: {
            secureId: item.secureId
        }
    });
};

const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page;
};

onMounted(() => {
    getNewsList();
});

</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Username</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ store.username }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-key text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-muted-color">You're login as </span>
                <span class="text-primary font-medium"> {{ store.username }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Role</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ store.role }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shield text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-muted-color">Your role is </span>
                <span class="text-primary font-medium">{{ store.role }}</span>
            </div>
        </div>
        <!-- <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Client</span>
                        <Skeleton v-if="loadingClients" width="3rem" height="2.2rem"></Skeleton>
                        <div v-else class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ clients.length || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-muted-color">registered client</span>
            </div>
        </div> -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">News</span>
                        <Skeleton v-if="loadingNews" width="3rem" height="2.2rem"></Skeleton>
                        <div v-else class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ news.length || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-megaphone text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-muted-color">total news</span>
            </div>
        </div>

        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Recent News</div>
                <DataTable :loading="loadingNews" :value="news" :rows="5" responsiveLayout="scroll">
                    <template #empty> No News found. </template>
                    <template #loading> Loading News data. Please wait. </template>
                    <Column field="title" header="Title" sortable style="min-width: 16rem">
                        <template #body="slotProps">
                            <Button :label="slotProps.data?.title" link @click="() => handleNewsDetail(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="description" header="Description" :sortable="true" style="width: 35%"></Column>
                    <Column style="width: 15%" header="Image">
                        <template #body="slotProps">
                            <img :src="slotProps.data?.photoVos[slotProps.data?.photoVos.length - 1]?.photo || '/images/placeholder-image.png'" alt="sample content" class="rounded" width="50" />
                        </template>
                    </Column>
                    <template #footer>
                        <Paginator @page="handlePage" :rows="options.rowsPage" :totalRecords="totalRecords" :rowsPerPageOptions="[5, 10, 20]"></Paginator>
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
