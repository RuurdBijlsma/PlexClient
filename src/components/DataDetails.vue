<template>
    <div>
        <p v-if="metadata.summary" class="show-summary mt-3">{{ metadata.summary }}</p>
        <div class="data-details">
            <p class="show-detail">
                    <span v-for="(genre, i) in metadata.Genre" :key="genre.id">
                        <router-link no-style
                                     :to="`/library/${metadata.librarySectionID}/?filter=genre~${genre.id}`"
                                     class="show-value">{{ genre.tag }}</router-link><span
                        v-if="i < metadata.Genre.length - 1"> • </span>
                    </span>
            </p>
            <p class="show-detail mt-3" v-if="metadata.Director && metadata.Director.length > 0">Directed by:
                <span v-for="(director, i) in metadata.Director" :key="director.id">
                        <router-link no-style
                                     :to="`/library/${metadata.librarySectionID}/?filter=director~${director.id}`"
                                     class="show-value">{{ director.tag }}</router-link><span
                    v-if="i < metadata.Director.length - 1">, </span>
                    </span>
            </p>
            <p class="show-detail" v-if="metadata.Writer && metadata.Writer.length > 0">Written by:
                <span v-for="(writer, i) in metadata.Writer" :key="writer.id">
                        <router-link no-style :to="`/library/${metadata.librarySectionID}/?filter=writer~${writer.id}`"
                                     class="show-value">{{ writer.tag }}</router-link><span
                    v-if="i < metadata.Writer.length - 1">, </span>
                    </span>
            </p>
            <p class="show-detail" v-if="metadata.Country && metadata.Country.length > 0">Created in:
                <span v-for="(country, i) in metadata.Country" :key="country.id">
                        <router-link no-style
                                     :to="`/library/${metadata.librarySectionID}/?filter=country~${country.id}`"
                                     class="show-value">{{ country.tag }}</router-link><span
                    v-if="i < metadata.Country.length - 1">, </span>
                    </span>
            </p>
            <p class="show-detail" v-if="metadata.studio">Studio:
                <router-link class="show-value" no-style
                             :to="`/library/${metadata.librarySectionID}/?filter=studio~${metadata.studio}`">
                    {{ metadata.studio }}
                </router-link>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: "DataDetails",
    props: {
        metadata: {
            type: Object,
            default: null,
        },
    },
    computed: {},
}
</script>

<style scoped>
.show-detail {
    font-size: 14px;
}

.show-value {
    font-size: 14px;
    font-weight: bold;
}

.show-summary {
    font-size: 14px;
    width: 100%;
    max-width: 600px;
}

.data-details > p {
    margin-top: 0px;
    margin-bottom: 0px;
}
</style>