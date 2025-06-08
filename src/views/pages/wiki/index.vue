<script setup>
  import { WIKI } from "@/router/constants";
  import WikiService from "@/service/WikiService";
  import TopicService from "@/service/TopicService";
  import { FilterMatchMode } from "@primevue/core/api";
  import { useToast } from "primevue/usetoast";
  import { onMounted, reactive, ref, watch } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const wikiService = reactive(new WikiService());
  const topicService = reactive(new TopicService());

  const toast = useToast();
  const wikiData = ref();
  const deleteWikiDialog = ref(false);
  const wiki = ref({});
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

  const expandedRows = ref({});

  const getList = async () => {
    try {
      loading.value = true;
      const { data } = await wikiService.list({
        page: options.value.currentPage,
        limit: options.value.rowsPage,
      });

      if (data.status === "success") {
        wikiData.value = data.data;
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
      name: WIKI.CREATE,
    });
  };

  function confirmDeleteWiki(data) {
    wiki.value = { ...data };
    deleteWikiDialog.value = true;
  }

  const editWiki = (item) => {
    router.push({
      name: WIKI.UPDATE,
      params: {
        secureId: item.id,
      },
    });
  };

  const handleDetail = (item) => {
    router.push({
      name: WIKI.DETAIL,
      params: {
        secureId: item.id,
      },
    });
  };

  const handleWikiDetail = (item) => {
    const index = wikiData.value.findIndex((val) => val.id === item.topicId);

    if (index == -1) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Topic not found!",
        life: 3000,
      });
    }

    router.push({
      name: WIKI.DETAIL,
      params: {
        secureId: wikiData.value[index].id,
      },
    });
  };

  const loadingDelete = ref(false);
  async function deleteWiki() {
    try {
      loadingDelete.value = true;

      const { data } = await topicService.delete(wiki.value?.id);

      if (data.status === "success") {
        wikiData.value = wikiData.value.filter(
          (val) => val.id !== wiki.value?.id
        );
        wiki.value = {};
        deleteWikiDialog.value = false;
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Wiki Deleted",
          life: 3000,
        });
      } else {
        console.error(data);
        throw new Error("Failed to Delete Wiki!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to Delete Wiki!",
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
        :value="wikiData"
        dataKey="id"
        :filters="filters"
        v-model:expandedRows="expandedRows"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <p class="m-0">Manage Wiki</p>
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
        <template #empty> No Wiki found. </template>
        <template #loading> Loading Wiki data. Please wait. </template>
        <Column expander style="width: 5rem" />
        <Column field="id" header="No" sortable style="min-width: 2rem" />
        <Column field="title" header="Topic" sortable style="min-width: 16rem">
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
        <Column header="Action" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editWiki(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteWiki(slotProps.data)"
            />
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-4">
            <p class="py-2.5">Wiki List</p>
            <DataTable
              :value="slotProps.data.wiki"
              paginator
              :rows="5"
              :rowsPerPageOptions="[5, 10, 20, 50]"
            >
              <Column field="title" header="Title" sortable>
                <template #body="slotProps">
                  <Button
                    :label="slotProps.data?.title"
                    link
                    @click="() => handleWikiDetail(slotProps.data)"
                  />
                </template>
              </Column>
              <Column field="description" header="Description" sortable>
                <template #body="slotProps">
                  <div class="line-clamp-2">
                    {{ slotProps.data?.description }}
                  </div>
                </template>
              </Column>
              <Column header="Thumbnail" style="min-width: 12rem">
                <template #body="slotProps">
                  <img
                    :src="slotProps.data?.thumbnailUrl"
                    :alt="slotProps.data?.title"
                    class="rounded"
                    style="width: 128px"
                  />
                </template>
              </Column>

              <Column
                field="user.name"
                header="Author"
                sortable
                style="min-width: 12rem"
              >
                <template #body="slotProps">
                  <Chip>{{ slotProps.data?.user?.name }}</Chip>
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
            </DataTable>
          </div>
        </template>
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
      v-model:visible="deleteWikiDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="wiki">
          Are you sure you want to delete <b>{{ wiki.title }} </b>?
        </span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteWikiDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="deleteWiki"
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
