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
            <v-divider class="mt-2 mb-2"></v-divider>
            <div class="show-value episode-sub-header mt-2">
                <router-link no-style :to="`/library/${episode.librarySectionID}/?filter=year~${episode.year}`"
                             class="ml-3">
                    {{ episode.year }}
                </router-link>
                <span class="ml-8">{{ duration }}</span>
                <v-chip :to="`/library/${episode.librarySectionID}/?filter=contentRating~${episode.contentRating}`"
                        class="ml-8" small>{{ episode.contentRating }}
                </v-chip>
            </div>
            <v-divider class="mt-2 mb-2"></v-divider>
            <div class="episode-buttons mt-3">
                <v-btn color="primary" small rounded elevation="0">
                    <v-icon class="mr-2">mdi-play</v-icon>
                    Play
                </v-btn>
                <div>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="ml-5"
                                   plain
                                   icon v-bind="attrs"
                                   v-on="on">
                                <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
                            </v-btn>
                        </template>
                        <span>Mark as watched</span>
                    </v-tooltip>
                    <v-btn class="ml-5 mr-2" icon plain>
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </div>
            </div>
            <p class="show-detail mt-3">{{ availableAt }}</p>
            <p class="show-summary">{{ episode.summary }}</p>
            <p class="show-detail">Written by:
                <span v-for="(writer, i) in episode.Writer" :key="writer.id">
                        <router-link no-style :to="`/library/${episode.librarySectionID}/?filter=writer~${writer.id}`"
                                     class="show-value">{{ writer.tag }}</router-link><span
                    v-if="i < episode.Writer.length - 1">, </span>
                    </span>
            </p>
        </div>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import Utils from "@/js/Utils";

export default {
    name: "Show",
    components: {ItemRow, PlexImage, MediaItem},
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
            Utils.niceTime( new Date(this.episode.Media[0]?.duration));
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

.episode-sub-header {
    display: flex;
    align-items: center;
}

.show-summary {
    font-size: 14px;
    width: 100%;
    max-width: 600px;
}

.show-detail {
    font-size: 14px;
}

.show-parent {
    font-weight: bold;
}

.show-parent > p {
    margin-top: 0px;
    margin-bottom: 0px;
}

.episode-buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 600px;
}
</style>