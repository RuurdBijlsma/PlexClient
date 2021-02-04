<template>
    <div v-if="season" class="show">
        <div class="left-column">
            <plex-image
                glow
                class="ml-6"
                rounding="10px"
                :src="season.thumb"
                :width="200"
                :height="300"/>
        </div>
        <div class="right-column">
            <router-link no-style :to="`/show/${season.parentRatingKey}`" class="show-title">
                <h2>{{ season.parentTitle }}</h2>
            </router-link>
            <router-link no-style :to="`/season/${season.ratingKey}`" class="show-value">
                <p>{{ season.title }}</p>
            </router-link>
            <v-divider/>
            <data-details class="mt-2" :metadata="season"/>
            <data-play class="mt-3" :metadata="season"/>
            <h3 class="sub-header" :class="{'mt-13': season.summary}">Episodes</h3>
            <div class="seasons">
                <media-item class="season" v-for="season in episodes" :item="season" :size="250"/>
            </div>
        </div>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataDetails from "@/components/DataDetails";
import DataPlay from "@/components/DataPlay";

export default {
    name: "Show",
    components: {DataPlay, DataDetails, ItemRow, PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        console.log(5555, this.key);
        await this.init();
        console.log(this.season);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then(e => console.log('meta', e));
            this.updateMetadataChildren(this.key).then(e => console.log('child', e));
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateMetadata', 'updateMetadataChildren', 'updateMetadataRelated']),
    },
    computed: {
        key() {
            return this.$route.params.key ?? '1';
        },
        season() {
            return this.$store.state.plex.content['metadata' + this.key];
        },
        episodes() {
            return this.$store.state.plex.content['metadataChildren' + this.key];
        },
    },
    watch: {
        key() {
            this.init();
        },
    },
}
</script>

<style scoped>
.show {
    max-width: 1300px;
    width: calc(100% - 20px);
    padding: 30px 10px;
    margin: 0 auto;
    display: flex;
}

.left-column {
    position: fixed;
}

.right-column {
    width: calc(100% - 224px - 50px);
    margin-left: calc(224px + 50px);
}

.show-title {
    font-weight: 400;
}

.sub-header {
    font-weight: 400;
    opacity: 0.8;
    margin: 10px 0;
}

.show-value {
    font-weight: bold;
}

.seasons {
    margin-left: -15px;
}

.season {
    margin: 8px 15px;
}

</style>