<script setup>
import PositionService from '@/service/PositionService';
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import { reactive, ref } from 'vue';

import * as zod from 'zod';

const emit = defineEmits(['close', 'getPosition']);
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const toast = useToast();
const loadingSubmitPosition = ref(false);
const positionService = reactive(new PositionService());
const crudPosition = defineModel();

const validationSchema = toTypedSchema(
    zod.object({
        name: zod.string().min(1, { message: 'Name is Required' })
    })
);
const { handleSubmit } = useForm({
    validationSchema
});

const savePosition = handleSubmit(async (values) => {
    if (values?.name.trim()) {
        loadingSubmitPosition.value = true;

        try {
            const payload = {
                name: values?.name
            };

            const secureId = crudPosition.value?.secureId || null;
            const type = secureId ? 'update' : 'create';

            const {
                data: { result, message }
            } = await positionService[type](payload, secureId);

            if (message == 'OK') {
                emit('getPosition');

                toast.add({ severity: 'success', summary: 'Successful', detail: 'Position Created', life: 3000 });
                emit('close');
                crudPosition.value = {};
            } else {
                throw new Error('Failed to save data! ' + result);
            }
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save data!', life: 3000 });
        } finally {
            loadingSubmitPosition.value = false;
        }
    }
});
</script>

<template>
    <Dialog :visible="props.visible" :style="{ width: '450px' }" header="Position" :closable="false" :modal="true">
        <div class="flex flex-col gap-6">
            <FieldText name="name" label="Name" :values="crudPosition.name" />
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="emit('close')" />
            <Button label="Save" icon="pi pi-check" @click="savePosition" :loading="loadingSubmitPosition" />
        </template>
    </Dialog>
</template>
