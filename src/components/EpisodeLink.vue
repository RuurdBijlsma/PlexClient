<template>
<span v-if="item">
    <router-link :title="item.parentTitle" :to="`/season/${item.parentRatingKey}`"
                 no-style>S{{ item.parentIndex }}</router-link>
    <span> • </span>
    <router-link :title="item.title" :to="`/episode/${item.ratingKey}`" no-style>E{{
            item.index
        }}</router-link>
</span>
</template>

<script>
export default {
    name: "EpisodeLink",
    props: {
        item: {
            type: Object,
            default: null,
        },
    },
}
</script>

<style scoped>

</style>