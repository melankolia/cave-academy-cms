<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { WIKI, DASHBOARD } from "@/router/constants";
  import WikiService from "@/service/WikiService";
  import TopicService from "@/service/TopicService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";
  import CreateWiki from "./components/Dialog/CreateWiki.vue";
  import { useConfirm } from "primevue/useconfirm";

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const confirm = useConfirm();

  const wikiService = reactive(new WikiService());
  const topicService = reactive(new TopicService());
  const loading = ref(false);
  const visible = ref(false);

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
      wikis: zod.array(zod.any()).min(1, { message: "Wiki is Required" }),
    })
  );

  const { errors, meta, values, setValues } = useForm({
    validationSchema,
    initialValues: {
      title: "",
      description: "",
      wikis: [],
    },
  });

  const breadcrumbHome = ref({ icon: "pi pi-home", route: DASHBOARD.LIST });

  const breadcrumbItems = ref([
    { label: "Wiki List", route: WIKI.LIST },
    { label: "Wiki Detail" },
  ]);

  onMounted(() => {
    getDetail();
  });

  const getDetail = async () => {
    try {
      loading.value = true;
      const id = route.params?.secureId;

      const { data } = await topicService.details(id);
      if (data.status === "success") {
        const result = data.data;

        setValues({
          title: result.title,
          description: result.description,
          wikis: result.wikis,
        });
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

  const onCancel = () => {
    router.replace({
      name: WIKI.LIST,
    });
  };

  const {
    value: wikis,
    errorMessage: wikisError,
    meta: wikisMeta,
    setValue: setValueWikis,
    setTouched: setWikisTouched,
  } = useField("wikis");

  const selectedWiki = ref({});
  const handleWikiSubmit = (e) => {
    try {
      selectedWiki.value = null;

      const result = [...wikis.value, e];

      setValueWikis(result);
      setWikisTouched(true);

      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  };

  const handleWikiUpdate = (e) => {
    const updatedWiki = { ...wikis.value[selectedWiki.value.index], ...e };
    const updatedWikis = [...wikis.value];
    updatedWikis[selectedWiki.value.index] = updatedWiki;

    setValueWikis(updatedWikis);
    setWikisTouched(true);

    selectedWiki.value = null;
    visible.value = false;
  };

  const handleDetail = ({ data, index }) => {
    selectedWiki.value = { ...data, index };
    visible.value = true;
  };

  const handleCancelWiki = () => {
    selectedWiki.value = null;
    visible.value = false;
  };

  const loadingDelete = ref(false);
  const confirmDeleteTopic = () => {
    confirm.require({
      message: `Are you sure you want to delete ${values.title}?`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Delete",
        severity: "danger",
      },
      accept: () => {
        deleteTopic();
      },
    });
  };

  const deleteTopic = async () => {
    const secureId = route.params?.secureId;
    try {
      loadingDelete.value = true;
      const {
        data: { status },
      } = await topicService.delete(secureId);
      if (status == "success") {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Topic deleted successfully",
        });

        router.replace({
          name: WIKI.LIST,
        });
      }
    } catch (error) {
      console.error("Error in deleteTopic:", error);
    } finally {
      loadingDelete.value = false;
    }
  };

  const cbDeleteWiki = (data) => {
    const filtered = wikis.value.filter((e, index) => index !== data.index);
    setValueWikis(filtered);
    setWikisTouched(true);
  };

  const handleDeleteWiki = (data) => {
    confirm.require({
      message: `Are you sure you want to delete this ${data?.data?.title || ""}?`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Delete",
        severity: "danger",
      },
      accept: () => {
        deleteWiki(data, () => cbDeleteWiki(data));
      },
    });
  };

  const loadingDeleteWiki = ref(false);
  const deleteWiki = async ({ data }, callback) => {
    const secureId = data.id;
    try {
      loadingDeleteWiki.value = true;
      const {
        data: { status },
      } = await wikiService.delete(secureId);

      if (status === "success") {
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Wiki deleted",
          life: 3000,
        });

        callback(data);
      } else {
        throw new Error("Failed to delete data!");
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error Data",
        detail: "Failed to delete data!",
        life: 3000,
      });
    } finally {
      loadingDeleteWiki.value = false;
    }
  };

  const onEdit = () => {
    router.push({
      name: WIKI.UPDATE,
      params: {
        secureId: route.params?.secureId,
      },
    });
  };
</script>

<template>
  <div class="card">
    <ConfirmDialog />

    <Toolbar>
      <template #start>
        <Breadcrumb
          style="padding: 4px"
          :home="breadcrumbHome"
          :model="breadcrumbItems"
        >
          <template #item="{ item, props }">
            <router-link
              v-if="item.route"
              v-slot="{ href, navigate }"
              :to="{ name: item.route }"
              custom
            >
              <a :href="href" v-bind="props.action" @click="navigate">
                <span :class="[item.icon, 'text-color']" />
                <span class="text-primary font-semibold">{{ item.label }}</span>
              </a>
            </router-link>
            <a
              v-else
              :href="item.url"
              :target="item.target"
              v-bind="props.action"
            >
              <span class="text-surface-700 dark:text-surface-0">{{
                item.label
              }}</span>
            </a>
          </template>
        </Breadcrumb>
      </template>
    </Toolbar>
  </div>

  <div v-if="loading">
    <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
    <SkeletonCard />
  </div>
  <template v-else>
    <div class="card mb-2">
      <div class="font-semibold text-2xl mb-8">Topic Detail</div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="values.title"
          disabled
        />
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="values.description"
          rows="8"
          disabled
        />
      </div>
    </div>

    <div class="card surface-ground mt-4">
      <div class="font-semibold text-2xl mb-8">Wiki List</div>
      <DataTable
        :value="wikis"
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #empty> No Wiki found. </template>
        <template #loading> Loading Wiki data. Please wait. </template>
        <Column field="title" header="Title" sortable>
          <template #body="slotProps">
            <div class="line-clamp-2">
              <Button
                :label="slotProps.data?.title"
                link
                @click="() => handleDetail(slotProps)"
              />
            </div>
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
        <Column header="Action" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              label="Delete"
              icon="pi pi-times"
              severity="danger"
              class="p-button-text"
              @click="handleDeleteWiki(slotProps)"
            />
          </template>
        </Column>
      </DataTable>
      <small v-if="meta.touched && !meta.valid" class="text-red-500 px-4 my-2">
        {{ errors.wikis }}
      </small>
    </div>

    <div class="card surface-ground py-5 mt-4">
      <div class="flex justify-end px-4">
        <div class="flex gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            class="w-[130px]"
            outlined
            @click="onCancel"
          />
          <Button
            label="Edit Topic"
            icon="pi pi-pencil"
            severity="primary"
            class="dark:text-white"
            @click="onEdit"
          />
          <Button
            :loading="loadingDelete"
            label="Delete Topic"
            icon="pi pi-trash"
            severity="danger"
            class="dark:text-white"
            @click="confirmDeleteTopic"
          />
        </div>
      </div>
    </div>
  </template>

  <CreateWiki
    :selected="selectedWiki"
    :visible="visible"
    @onCancel="handleCancelWiki"
    @onSubmit="(e) => handleWikiSubmit(e)"
    @onUpdate="(e) => handleWikiUpdate(e)"
  />
</template>
