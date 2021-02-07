<template>
<span v-if="metadata">
    <router-link :title="metadata.parentTitle" :to="`/season/${metadata.parentRatingKey}`"
                 no-style>S{{ metadata.parentIndex }}</router-link>
    <span> • </span>
    <router-link :title="metadata.title" :to="`/episode/${metadata.ratingKey}`" no-style>E{{
            metadata.index
        }}</router-link>
</span>
</template>

<script>
export default {
    name: "EpisodeLink",
    props: {
        metadata: {
            type: Object,
            default: null,
        },
    },
}
</script>

<style scoped>

</style>