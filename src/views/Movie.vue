<template>
    <div v-if="movie" class="show">
        <div class="left-column">
            <plex-image :src="movie.thumb" glow
                        :width="250" :height="375"
                        rounding="10px" :item="movie"
                        class="ml-6"
                        hide-title></plex-image>
        </div>
        <div class="right-column">
            <router-link no-style :to="`/episode/${movie.ratingKey}`" class="show-title">
                <h2>{{ movie.title }}</h2>
            </router-link>
            <data-header :metadata="movie"/>
            <data-play class="mt-3" :metadata="movie"/>
            <data-details :metadata="movie"/>
            <item-row :section-key="movie.librarySectionID" class="mt-13" title="Cast" :items="movie.Role"
                      type="actor"/>
            <item-row :section-key="movie.librarySectionID" v-for="item in related" class="mt-13" :title="item.title"
                      :items="item.Metadata"></item-row>
            <h3 class="sub-header mt-13">Similar movies</h3>
            <v-chip-group show-arrows>
                <v-chip v-for="item in movie.Similar" :key="item.id">{{ item.tag }}</v-chip>
            </v-chip-group>
        </div>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import Utils from "@/js/Utils";
import DataDetails from "@/components/DataDetails";
import DataHeader from "@/components/DataHeader";
import DataPlay from "@/components/DataPlay";

export default {
    name: "Show",
    components: {DataPlay, DataHeader, DataDetails, ItemRow, PlexImage, MediaItem},
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
    width: calc(100% - 274px - 50px);
    margin-left: calc(274px + 50px);
}

.show-title {
    font-weight: 400;
}

.sub-header {
    font-weight: 400;
    opacity: 0.8;
    margin: 10px 0;
}
</style>