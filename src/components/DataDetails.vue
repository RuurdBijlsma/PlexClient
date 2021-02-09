<template>
    <div>
        <p v-if="item.summary" class="show-summary mt-3">{{ item.summary }}</p>
        <div class="data-details">
            <p class="show-detail">
                    <span v-for="(genre, i) in item.Genre" :key="genre.id">
                        <router-link no-style
                                     :to="`/library/${item.librarySectionID}/?filter=genre~${genre.id}`"
                                     class="show-value">{{ genre.tag }}</router-link><span
                        v-if="i < item.Genre.length - 1"> • </span>
                    </span>
            </p>
            <p class="show-detail mt-3" v-if="item.Director && item.Director.length > 0">Directed by:
                <span v-for="(director, i) in item.Director" :key="director.id">
                        <router-link no-style
                                     :to="`/library/${item.librarySectionID}/?filter=director~${director.id}`"
                                     class="show-value">{{ director.tag }}</router-link><span
                    v-if="i < item.Director.length - 1">, </span>
                    </span>
            </p>
            <p class="show-detail" v-if="item.Writer && item.Writer.length > 0">Written by:
                <span v-for="(writer, i) in item.Writer" :key="writer.id">
                        <router-link no-style :to="`/library/${item.librarySectionID}/?filter=writer~${writer.id}`"
                                     class="show-value">{{ writer.tag }}</router-link><span
                    v-if="i < item.Writer.length - 1">, </span>
                    </span>
            </p>
            <p class="show-detail" v-if="item.Country && item.Country.length > 0">Created in:
                <span v-for="(country, i) in item.Country" :key="country.id">
                        <router-link no-style
                                     :to="`/library/${item.librarySectionID}/?filter=country~${country.id}`"
                                     class="show-value">{{ country.tag }}</router-link><span
                    v-if="i < item.Country.length - 1">, </span>
                    </span>
            </p>
            <p class="show-detail" v-if="item.studio">Studio:
                <router-link class="show-value" no-style
                             :to="`/library/${item.librarySectionID}/?filter=studio~${item.studio}`">
                    {{ item.studio }}
                </router-link>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: "DataDetails",
    props: {
        item: {
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