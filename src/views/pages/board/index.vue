<script setup>
import BoardService from '@/service/BoardService';
import PositionService from '@/service/PositionService';
import { useAuthStore } from '@/store/auth';
import { FilterMatchMode } from '@primevue/core/api';
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from 'primevue/usetoast';
import { useField, useForm } from 'vee-validate';
import { onMounted, reactive, ref } from 'vue';
import * as zod from 'zod';
import DialogPosition from './Position/index.vue';

const boardService = reactive(new BoardService());
const positionService = reactive(new PositionService());
const store = useAuthStore();
const toast = useToast();
const dt = ref();
const boards = ref();
const boardDialog = ref(false);
const deleteBoardDialog = ref(false);
const board = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const positions = ref([]);
const loadingPositions = ref(false);
const loading = ref(false);
const photo = ref(null);

const validationSchema = toTypedSchema(
    zod.object({
        name: zod.string().min(1, { message: 'Name is Required' }),
        position: zod.object({
            name: zod.string().min(1, { message: 'Position is Required' }),
            secureId: zod.string().nullable()
        }),
        description: zod.any().optional().nullable(),
        photo: zod.string().min(1, { message: 'Photo is Required' })
    })
);
const { handleSubmit } = useForm({
    validationSchema
});

const { setValue: setValuePhoto, meta: metaPhoto, errorMessage: errorMessagePhoto } = useField('photo');
const { setValue: setPosition, meta: metaPosition, errorMessage: errorMessagePosition } = useField('position');

onMounted(() => {
    getPositions();
    getList();
});

const getPositions = async () => {
    loadingPositions.value = true;
    positionService
        .list()
        .then(({ data: { result, message } }) => {
            if (message == 'OK') {
                positions.value = result;
            } else {
                throw new Error('Failed to fetch position data!');
            }
        })
        .catch((error) => {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch position data!', life: 3000 });
        })
        .finally(() => (loadingPositions.value = false));
};

const getList = async () => {
    try {
        loading.value = true;
        const {
            data: { result, message }
        } = await boardService.list();
        if (message == 'OK') {
            boards.value = [...result];
        } else {
            throw new Error('Failed to fetch data!');
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data!', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const onUpload = async (event) => {
    if (event?.xhr?.status == 200) {
        try {
            const { result } = await JSON.parse(event.xhr.response);
            board.value.photo = result.imageUri;
            setValuePhoto(result.imageUri);

            toast.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded', life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Photos Upload Failed', life: 3000 });
        }
    }
};

const handlePhotosError = () => {
    photo.value.clear();
    setValuePhoto(null);
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Photos Upload Failed', life: 3000 });
};

const handlePhotoRemove = () => {
    board.value.photo = null;
    setValuePhoto(null);
};

function openNew() {
    board.value = {};
    submitted.value = false;
    boardDialog.value = true;
}

function hideDialog() {
    boardDialog.value = false;
    submitted.value = false;
}

const loadingSubmitBoard = ref(false);
const saveBoard = handleSubmit(async (values) => {
    submitted.value = true;

    if (values?.name?.trim()) {
        loadingSubmitBoard.value = true;
        try {
            const payload = {
                name: values.name,
                positionId: values.position?.secureId,
                photo: values.photo,
                description: values.description
            };

            const secureId = board.value?.secureId;
            const type = secureId ? 'update' : 'create';

            const {
                data: { result, message }
            } = await boardService[type](payload, secureId);

            if (message == 'OK') {
                getList();

                toast.add({ severity: 'success', summary: 'Successful', detail: 'Board Created', life: 3000 });
                boardDialog.value = false;
                board.value = {};
            } else {
                throw new Error('Failed to save data! ' + result);
            }
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save data!', life: 3000 });
        } finally {
            loadingSubmitBoard.value = false;
        }
    }
});

function editBoard(prod) {
    board.value = { ...prod };
    boardDialog.value = true;
}

function confirmDeleteBoard(prod) {
    board.value = prod;
    deleteBoardDialog.value = true;
}

const loadingDelete = ref(false);
async function deleteBoard() {
    try {
        loadingDelete.value = true;

        const {
            data: { result, message }
        } = await boardService.delete(board.value?.secureId);

        if (message == 'OK') {
            boards.value = boards.value.filter((val) => val.secureId !== board.value.secureId);
            deleteBoardDialog.value = false;
            board.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Board Deleted', life: 3000 });
        } else {
            throw new Error(`Failed to delete data! ${result}`);
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete data!', life: 3000 });
    } finally {
        loadingDelete.value = false;
    }
}

const setValuePosition = (val) => {
    board.value.position = { ...val };
    setPosition({ ...val });
};

const crudPositionDialog = ref(false);
const crudPosition = ref({
    submitted: false,
    secureId: null,
    name: null
});

const showPosition = (position = null) => {
    crudPositionDialog.value = true;
    crudPosition.value = {
        ...crudPosition.value,
        ...position
    };
};
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :loading="loading"
                :value="boards"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Data"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Boards</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <template #empty> No Boards found. </template>
                <template #loading> Loading Boards data. Please wait. </template>

                <Column field="name" header="Name" sortable style="min-width: 10rem" />
                <Column field="position" header="Position" sortable style="min-width: 10rem" />
                <Column field="description" header="Description" sortable style="min-width: 16rem" />
                <Column field="photo" header="Photo" style="min-width: 20rem">
                    <template #body="slotProps">
                        <img :src="slotProps.data.photo || '/images/placeholder-image.png'" alt="slotProps.data" class="rounded" style="max-width: 192px" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editBoard(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteBoard(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="boardDialog" :style="{ width: '450px' }" header="Board Details" :modal="true">
            <!-- <img v-if="board.photo" :src="board.photo" alt="board" class="block m-auto pb-4" /> -->
            <div class="flex flex-col gap-6">
                <FieldText name="name" label="Name" :values="board.name" />
                <div>
                    <label for="photo" class="block font-bold mb-3">Photo</label>
                    <FileUpload
                        @error="handlePhotosError"
                        :url="'/micro-api/board-image/upload?username=' + store.username"
                        ref="photo"
                        name="photos"
                        @upload="onUpload($event, 'photo')"
                        accept="image/*"
                        @clear="handlePhotoRemove"
                        @remove="handlePhotoRemove"
                        :maxFileSize="3000000"
                    />
                    <small v-if="!metaPhoto.valid" class="text-red-500">{{ errorMessagePhoto }}</small>
                </div>
                <FieldText name="description" label="Description" :values="board.description" />
                <div>
                    <label for="position" class="block font-bold mb-3">Position</label>
                    <div class="flex flex-row">
                        <Select name="position" id="position" class="flex-1" :model-value="board.position" @update:model-value="setValuePosition" :options="positions" optionLabel="name" placeholder="Select a Position" fluid>
                            <template #value="slotProps">
                                <div v-if="slotProps?.value" class="flex items-center">
                                    {{ slotProps?.value?.name || slotProps?.value }}
                                </div>
                                <div v-else>{{ slotProps.placeholder }}</div>
                            </template>
                            <template #option="{ option }">
                                <div class="flex flex-row justify-between items-center w-full">
                                    <p class="m-0">{{ option.name }}</p>
                                    <Button icon="pi pi-pencil" rounded class="mr-2" @click="() => showPosition(option)" />
                                </div>
                            </template>
                        </Select>
                        <Button type="button" icon="pi pi-plus" class="ml-2" @click="showPosition" rounded size="small" />
                    </div>
                    <small v-if="!metaPosition.valid" class="text-red-500">{{ errorMessagePosition }}</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveBoard" :loading="loadingSubmitBoard" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteBoardDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="board"
                    >Are you sure you want to delete <b>{{ board.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteBoardDialog = false" />
                <Button :loading="loadingDelete" label="Yes" icon="pi pi-check" @click="deleteBoard" />
            </template>
        </Dialog>

        <DialogPosition v-model="crudPosition" :visible="crudPositionDialog" @close="crudPositionDialog = false" @getPosition="getPositions" />
    </div>
</template>
