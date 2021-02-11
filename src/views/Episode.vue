<template>
    <glow-column-page v-if="episode" :src="episode.thumb"
                      :img-width="350 * uiScale"
                      :img-height="350 / 16 * 9 * uiScale">
        <router-link no-style :to="`/show/${episode.grandparentRatingKey}`" class="show-title">
            <h2>{{ episode.grandparentTitle }}</h2>
        </router-link>
        <router-link no-style :to="`/season/${episode.parentRatingKey}`" class="show-parent">
            <p>{{ episode.parentTitle }}</p>
        </router-link>
        <p>Episode {{ episode.index }} •
            <router-link no-style :to="`/episode/${episode.ratingKey}`" class="show-parent">
                {{ episode.title }}
            </router-link>
        </p>
        <data-header :item="episode"/>
        <data-play class="mt-3" :item="episode"/>
        <data-details :item="episode"/>
    </glow-column-page>
</template>

<script>
import {mapActions, mapState} from "vuex";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import Utils from "@/js/Utils";
import DataHeader from "@/components/DataHeader";
import DataDetails from "@/components/DataDetails";
import DataPlay from "@/components/DataPlay";
import GlowColumnPage from "@/components/GlowColumnPage";
import PlexPlayer from "@/components/PlexPlayer";

export default {
    name: "Episode",
    components: {PlexPlayer, GlowColumnPage, DataPlay, DataDetails, DataHeader, ItemRow, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        await this.init();
        console.log(this.episode);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then(e => console.log('meta', e));
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateMetadata', 'updateMetadataChildren', 'updateMetadataRelated']),
    },
    computed: {
        duration() {
            Utils.niceTime(new Date(this.episode.Media[0]?.duration));
        },
        availableAt() {
            return Utils.niceDate(new Date(this.episode.originallyAvailableAt));
        },
        key() {
            return this.$route.params.key ?? '1';
        },
        episode() {
            return this.$store.state.plex.content['metadata' + this.key];
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

.show-parent {
    font-weight: bold;
}

.show-parent > p {
    margin-top: 0;
    margin-bottom: 0;
}
</style>