<script setup>
  import SkeletonCard from "@/components/Skeleton/Card.vue";
  import { WIKI } from "@/router/constants";
  import WikiService from "@/service/WikiService";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useToast } from "primevue/usetoast";
  import { useField, useForm } from "vee-validate";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import * as zod from "zod";
  import CreateWiki from "./components/Dialog/CreateWiki.vue";

  const wikiData = ref({
    title: "",
    description: "",
    wikis: [],
  });

  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const wikiService = reactive(new WikiService());
  const loadingSubmit = ref(false);
  const loading = ref(false);
  const visible = ref(false);

  const validationSchema = toTypedSchema(
    zod.object({
      title: zod.string().min(1, { message: "Title is Required" }),
      description: zod.string().min(1, { message: "Description is Required" }),
      wikis: zod.array(zod.any()).min(1, { message: "Wiki is Required" }),
    })
  );

  const { handleSubmit, errors, meta } = useForm({
    validationSchema,
    initialValues: {
      title: wikiData.value.title,
      description: wikiData.value.description,
      wikis: wikiData.value.wikis,
    },
  });

  const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });

  const isUpdate = computed(() => {
    return route.params?.secureId;
  });

  const breadcrumbItems = ref([
    { label: "Wiki List", url: "/wiki" },
    { label: "Wiki " + (isUpdate.value ? "Update" : "Create") },
  ]);

  onMounted(async () => {
    if (isUpdate.value) await getDetail();
  });

  const getDetail = async () => {
    try {
      loading.value = true;
      const id = route.params?.secureId;

      const { data } = await wikiService.details(id);
      if (data.status === "success") {
        const result = data.data;

        wikiData.value = result;
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
      router.back();
    } finally {
      loading.value = false;
    }
  };

  const onCancel = () => {
    router.replace({
      name: WIKI.LIST,
    });
  };

  const saveData = handleSubmit(async (values) => {
    try {
      loadingSubmit.value = true;

      const payload = {
        title: values?.title,
        description: values?.description,
      };

      let type = "create";
      if (isUpdate.value) type = "update";

      const id = wikiData.value?.id;

      const {
        data: { data, status },
      } = await wikiService[type](payload, id);

      if (status === "success") {
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: `Wiki ${isUpdate.value ? "Updated" : "Created"}`,
          life: 3000,
        });
        router.replace({
          name: WIKI.DETAIL,
          params: {
            secureId: data.id,
          },
        });
      } else {
        throw new Error(`Wiki ${isUpdate.value ? "Update" : "Create"} Failed`);
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: error.message,
        life: 3000,
      });
    } finally {
      loadingSubmit.value = false;
    }
  });

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
      const result = [...wikiData.value.wikis, e];

      setValueWikis(result);
      setWikisTouched(true);

      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditWiki = (data) => {
    selectedWiki.value = { ...data };
    visible.value = true;
  };

  const handleDeleteWiki = (data) => {
    const filtered = wikis.value.filter((e, index) => index !== data.index);
    setValueWikis(filtered);
    setWikisTouched(true);
  };
</script>

<template>
  <div class="card">
    <Toolbar>
      <template #start>
        <Breadcrumb
          style="padding: 4px"
          :home="breadcrumbHome"
          :model="breadcrumbItems"
        />
      </template>
    </Toolbar>
  </div>

  <div v-if="loading">
    <Skeleton class="mt-8 mb-6" width="10rem" height="2rem"></Skeleton>
    <SkeletonCard />
  </div>
  <template v-else>
    <div class="card mb-2">
      <div class="font-semibold text-2xl mb-8">
        {{ isUpdate ? "Update" : "Create" }} Topic
      </div>
      <div class="flex flex-col gap-4 w-full">
        <FieldText
          className="flex flex-col flex-wrap gap-2 w-full"
          name="title"
          label="Title"
          :values="wikiData.title"
        />
        <FieldTextArea
          className="flex flex-col flex-wrap gap-2 w-full"
          name="description"
          label="Description"
          :values="wikiData.description"
          rows="8"
        />
      </div>
    </div>

    <div class="card surface-ground mt-4">
      <DataTable
        :value="wikis"
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex flex-wrap justify-end gap-2">
            <Button
              text
              label="Add Wiki"
              icon="pi pi-plus"
              class="p-button-text"
              @click="visible = true"
            />
          </div>
        </template>
        <template #empty> No Wiki found. </template>
        <template #loading> Loading Wiki data. Please wait. </template>
        <Column field="title" header="Title" sortable> </Column>
        <Column field="description" header="Description" sortable>
          <template #body="slotProps">
            <div class="line-clamp-2">
              {{ slotProps.data?.description }}
            </div>
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
        <Column header="Action" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              severity="primary"
              class="p-button-text"
              @click="handleEditWiki(slotProps.data)"
            />
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
            label="Save Wiki"
            icon="pi pi-check"
            severity="primary"
            class="w-[130px]"
            @click="saveData"
            :loading="loadingSubmit"
          />
        </div>
      </div>
    </div>
  </template>

  <CreateWiki
    :selected="selectedWiki"
    :visible="visible"
    @onCancel="visible = $event"
    @onSubmit="(e) => handleWikiSubmit(e)"
  />
</template>
