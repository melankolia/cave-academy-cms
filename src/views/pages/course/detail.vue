<script setup>
import SkeletonCard from '@/components/Skeleton/Card.vue';
import { NEWS } from '@/router/constants';
import NewsService from '@/service/NewsService';
import { useToast } from 'primevue/usetoast';
import Galleria from 'primevue/galleria';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const newsService = reactive(new NewsService());
const loading = ref(false);

const responsiveOptions = ref([
    {
        breakpoint: '1300px',
        numVisible: 4
    },
    {
        breakpoint: '575px',
        numVisible: 1
    }
]);

const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'News List', url: '/news' }, { label: 'News Detail' }]);
const newsData = ref({
    secureId: null,
    title: null,
    description: null,
    videoUrl: null,
    isVideo: false,
    tags: null,
    photos: null,
    thumbnail: null,
    content: null
});

onMounted(async () => {
    try {
        loading.value = true;
        const secureId = route.params?.secureId;

        const {
            data: { result, message }
        } = await newsService.details(secureId);
        if (message == 'OK') {
            result.tags = result.tagResponseVos;
            result.photos = result.photoVos;
            result.isVideo = !!result.videoUrl;
            result.videos = result.videoUrl;

            newsData.value = result;
        } else {
            throw new Error('Failed to fetch data!');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error Data', detail: 'Failed to fetch data!', life: 3000 });
        router.back();
    } finally {
        loading.value = false;
    }
});

const onCancel = () => {
    router.push({
        name: NEWS.LIST
    });
};

const onEdit = () => {
    router.push({
        name: NEWS.UPDATE,
        params: {
            secureId: newsData.value?.secureId
        }
    });
};

const loadingDelete = ref(false);
const deleteNewsDialog = ref(false);
const onDelete = () => {
    deleteNewsDialog.value = true;
};
async function deleteNews() {
    try {
        loadingDelete.value = true;
        const {
            data: { result, message }
        } = await newsService.delete(newsData.value?.secureId);

        if (message == 'OK') {
            deleteNewsDialog.value = false;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'News Deleted', life: 3000 });
            router.replace({
                name: NEWS.LIST
            });
        } else {
            console.error(result);
            throw new Error('Failed to Delete News!');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error Data', detail: 'Failed to Delete News!', life: 3000 });
    } finally {
        loadingDelete.value = false;
    }
}
</script>

<template>
    <div class="card">
        <Toolbar>
            <template #start>
                <Breadcrumb style="padding: 4px" :home="breadcrumbHome" :model="breadcrumbItems" />
            </template>
        </Toolbar>
        <div v-if="loading">
            <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
            <SkeletonCard />
        </div>
        <div v-else>
            <div class="font-semibold text-2xl mt-8 mb-6">News Detail</div>
            <div class="flex flex-col gap-2">
                <Panel :header="newsData.title" :toggleable="true">
                    <p class="leading-normal m-0 min-h-1/4">
                        {{ newsData.description }}
                    </p>
                    <div class="flex flex-row gap-1 mt-3">
                        <Tag severity="info" :value="el.name" v-for="(el, id) in newsData.tags" :key="id"></Tag>
                    </div>
                </Panel>
                <Panel header="Photo" :toggleable="true">
                    <Galleria showItemNavigators showIndicators showIndicatorsOnItem :value="newsData.photos" :numVisible="5" :responsiveOptions="responsiveOptions" containerStyle="max-width: 640px">
                        <template #item="slotProps">
                            <img :src="slotProps.item.photo" :alt="slotProps.item.photo" style="width: 100%" />
                        </template>
                        <template #footer></template>
                    </Galleria>
                </Panel>
                <Panel v-if="newsData.isVideo" header="Video" :toggleable="true">
                    <div class="video-container">
                        <iframe :src="newsData.videoUrl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                </Panel>
                <Panel header="Thumbnail" :toggleable="true">
                    <img v-if="newsData.thumbnail" :src="newsData.thumbnail" alt="News Detail" class="rounded" style="width: 368px" />
                </Panel>
                <Panel header="Content" :toggleable="true">
                    <p>{{ newsData.content }}</p>
                </Panel>
            </div>
            <div class="flex flex-row justify-end mt-12 gap-4">
                <Button label="Cancel" icon="pi pi-times" severity="danger" text @click="onCancel" />
                <Button label="Delete Data" icon="pi pi-trash" severity="danger" @click="onDelete" />
                <Button label="Edit Data" icon="pi pi-pencil" @click="onEdit" />
            </div>
        </div>
        <Dialog v-model:visible="deleteNewsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span
                    >Are you sure you want to delete <b>{{ newsData.title }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteNewsDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteNews" :loading="loadingDelete" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.video-container {
    position: relative;
    width: 75%;
    padding-bottom: 56.25%; /* Aspect ratio for 16:9 video */
    height: 0;
    overflow: hidden;
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
