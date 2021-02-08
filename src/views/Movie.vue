<template>
    <glow-column-page v-if="movie"
                      :img-width="250 * uiScale"
                      :img-height="375 * uiScale"
                      :src="movie.thumb">
        <router-link no-style :to="`/movie/${movie.ratingKey}`" class="show-title">
            <h2>{{ movie.title }}</h2>
        </router-link>
        <data-header :metadata="movie"/>
        <data-play class="mt-3" :metadata="movie"/>
        <data-details :metadata="movie"/>
        <item-row class="mt-13" title="Cast" :items="movie.Role"
                  :size="130 * uiScale"
                  :section-key="movie.librarySectionID"
                  type="actor"/>
        <item-row v-for="item in related" class="mt-13" :title="item.title"
                  :size="130 * uiScale"
                  :items="item.Metadata"></item-row>
        <h3 class="sub-header mt-13">Similar movies</h3>
        <v-chip-group show-arrows>
            <v-chip v-for="item in movie.Similar" :key="item.id">{{ item.tag }}</v-chip>
        </v-chip-group>
    </glow-column-page>
</template>

<script>
import {mapActions, mapState} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import Utils from "@/js/Utils";
import DataDetails from "@/components/DataDetails";
import DataHeader from "@/components/DataHeader";
import DataPlay from "@/components/DataPlay";
import GlowColumnPage from "@/components/GlowColumnPage";

export default {
    name: "Show",
    components: {GlowColumnPage, DataPlay, DataHeader, DataDetails, ItemRow, PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        console.log(5555, this.key);
        await this.init();
        console.log(this.movie);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then(e => console.log('meta', e));
            this.updateMetadataRelated(this.key).then(e => console.log('related', e));
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateMetadata', 'updateMetadataChildren', 'updateMetadataRelated']),
    },
    computed: {
        availableAt() {
            return Utils.niceDate(new Date(this.movie.originallyAvailableAt));
        },
        key() {
            return this.$route.params.key ?? '1';
        },
        movie() {
            return this.$store.state.plex.content['metadata' + this.key];
        },
        related() {
            return this.$store.state.plex.content['metadataRelated' + this.key];
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
</style>