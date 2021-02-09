<template>
    <glow-column-page :src="season.thumb"
                      v-if="season"
                      :img-width="200 * uiScale"
                      :img-height="300 * uiScale">
        <router-link no-style :to="`/show/${season.parentRatingKey}`" class="show-title">
            <h2>{{ season.parentTitle }}</h2>
        </router-link>
        <router-link no-style :to="`/season/${season.ratingKey}`" class="show-value">
            <p>{{ season.title }}</p>
        </router-link>
        <v-divider/>
        <data-details class="mt-2" :item="season"/>
        <data-play class="mt-3" :item="season"/>
        <h3 class="sub-header" :class="{'mt-13': season.summary}">Episodes</h3>
        <div class="seasons">
            <media-item class="season" v-for="season in episodes" :item="season" :size="250 * uiScale"/>
        </div>
    </glow-column-page>
</template>

<script>
import {mapActions, mapState} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataDetails from "@/components/DataDetails";
import DataPlay from "@/components/DataPlay";
import GlowColumnPage from "@/components/GlowColumnPage";

export default {
    name: "Season",
    components: {GlowColumnPage, DataPlay, DataDetails, ItemRow, PlexImage, MediaItem},
    async mounted() {
        await this.$store.restored;
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
        ...mapState({
            uiScale: state => state.uiScale,
        }),
    },
    watch: {
        key() {
            this.init();
        },
    },
}
</script>

<style scoped>
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