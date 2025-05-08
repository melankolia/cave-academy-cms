<template>
    <div class="rounded border border-surface-200 dark:border-surface-700 p-6 bg-surface-0 dark:bg-surface-900">
        <div class="flex mb-4">
            <div>
                <Skeleton width="10rem" class="mb-2"></Skeleton>
                <Skeleton width="5rem" class="mb-2"></Skeleton>
                <Skeleton height=".5rem"></Skeleton>
            </div>
        </div>
        <Skeleton width="100%" height="280px"></Skeleton>
        <div class="flex justify-end mt-4 gap-4">
            <Skeleton width="6rem" height="2rem"></Skeleton>
            <Skeleton width="6rem" height="2rem"></Skeleton>
            <Skeleton width="6rem" height="2rem"></Skeleton>
        </div>
    </div>
</template>
