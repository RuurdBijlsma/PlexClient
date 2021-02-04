<template>
    <div v-if="episode" class="show">
        <div class="left-column">
            <plex-image :src="episode.thumb" glow
                        :width="350" :height="350/16*9"
                        rounding="10px" :item="episode"
                        class="ml-6"
                        hide-title></plex-image>
        </div>
        <div class="right-column">
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
            <data-header :metadata="episode"/>
            <data-play class="mt-3" :metadata="episode"/>
            <data-details :metadata="episode"/>
        </div>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import Utils from "@/js/Utils";
import DataHeader from "@/components/DataHeader";
import DataDetails from "@/components/DataDetails";
import DataPlay from "@/components/DataPlay";

export default {
    name: "Show",
    components: {DataPlay, DataDetails, DataHeader, ItemRow, PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        console.log(5555, this.key);
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
    width: calc(100% - 374px - 50px);
    margin-left: calc(374px + 50px);
}

.show-title {
    font-weight: 400;
}

.show-parent {
    font-weight: bold;
}

.show-parent > p {
    margin-top: 0px;
    margin-bottom: 0px;
}
</style>