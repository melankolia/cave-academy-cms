<script setup>
  import { EVENT } from "@/router/constants";
  import EventService from "@/service/EventService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const eventService = reactive(new EventService());
  const toast = useToast();
  const eventData = ref();
  const deleteEventDialog = ref(false);
  const event = ref({});
  const loading = ref(false);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const options = ref({
    rowsPage: 5,
    currentPage: 0,
  });

  const totalRecords = ref(0);
  onMounted(() => {
    getList();
  });

  const getList = async () => {
    try {
      loading.value = true;
      const { data } = await eventService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
      });

      if (data.status === "success") {
        eventData.value = data.data;
        totalRecords.value = data.data.length;
      } else {
        throw new Error("Failed to fetch data!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to fetch data!",
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const openNew = () => {
    router.push({
      name: EVENT.CREATE,
    });
  };

  function confirmDeleteEvent(prod) {
    event.value = prod;
    deleteEventDialog.value = true;
  }

  const editEvent = (item) => {
    router.push({
      name: EVENT.UPDATE,
      params: {
        secureId: item.id,
      },
    });
  };

  const handleDetail = (item) => {
    router.push({
      name: EVENT.DETAIL,
      params: {
        secureId: item.id,
      },
    });
  };

  const loadingDelete = ref(false);
  async function deleteEvent() {
    try {
      loadingDelete.value = true;
      const { data } = await eventService.delete(event.value?.id);

      if (data.status === "success") {
        eventData.value = eventData.value.filter(
          (val) => val.id !== event.value?.id
        );
        event.value = {};
        deleteEventDialog.value = false;
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Event Deleted",
          life: 3000,
        });
      } else {
        console.error(data);
        throw new Error("Failed to Delete Event!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to Delete Event!",
        life: 3000,
      });
    } finally {
      loadingDelete.value = false;
    }
  }

  const handlePage = (e) => {
    options.value.rowsPage = e.rows;
    options.value.currentPage = e.page;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  watch(
    () => options.value,
    (val) => {
      if (val !== null) getList();
    },
    { deep: true }
  );
</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button
            label="New"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            @click="openNew"
          />
        </template>
      </Toolbar>

      <DataTable
        :loading="loading"
        :value="eventData"
        dataKey="id"
        :filters="filters"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Event</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Search..."
              />
            </IconField>
          </div>
        </template>
        <template #empty> No Event found. </template>
        <template #loading> Loading Event data. Please wait. </template>
        <Column field="id" header="No" sortable style="min-width: 2rem" />
        <Column field="title" header="Title" sortable style="min-width: 16rem">
          <template #body="slotProps">
            <Button
              :label="slotProps.data?.title"
              link
              @click="() => handleDetail(slotProps.data)"
            />
          </template>
        </Column>
        <Column
          field="description"
          header="Description"
          style="min-width: 20rem"
        >
          <template #body="slotProps">
            <div class="line-clamp-2">{{ slotProps.data?.description }}</div>
          </template>
        </Column>
        <Column header="Image" style="min-width: 12rem">
          <template #body="slotProps">
            <img
              :src="slotProps.data?.imageUrl"
              :alt="slotProps.data?.title"
              class="rounded"
              style="width: 128px"
            />
          </template>
        </Column>
        <Column field="level" header="Level" sortable style="min-width: 8rem">
          <template #body="slotProps">
            <Chip :label="slotProps.data?.level" class="capitalize" />
          </template>
        </Column>
        <Column field="type" header="Type" sortable style="min-width: 8rem">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data?.isOnline ? 'online' : 'offline'"
              :severity="
                slotProps.data?.isOnline ? 'success' : 'danger'
              "
              class="capitalize"
            />
          </template>
        </Column>
        <Column :expor
        <Column
          field="author.name"
          header="Author"
          sortable
          style="min-width: 12rem"
        >
          <template #body="slotProps">
            <Chip>{{ slotProps.data?.author?.name }}</Chip>
          </template>
        </Column>
        <Column
          field="createdAt"
          header="Created At"
          sortable
          style="min-width: 14rem"
        >
          <template #body="slotProps">
            {{ formatDate(slotProps.data?.createdAt) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editEvent(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteEvent(slotProps.data)"
            />
          </template>
        </Column>
        <template #footer>
          <Paginator
            @page="handlePage"
            :rows="options.rowsPage"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[5, 10, 20]"
          ></Paginator>
        </template>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="deleteEventDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="event">
          Are you sure you want to delete <b>{{ event.title }} </b>?
        </span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteEventDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="deleteEvent"
          :loading="loadingDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
