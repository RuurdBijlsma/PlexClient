<template>
    <div class="episode-buttons">
        <v-btn color="primary" small rounded elevation="0">
            <v-icon class="mr-2">mdi-play</v-icon>
            Play
        </v-btn>
        <div>
            <v-tooltip top v-if="item.type !== 'playlist'">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn class="ml-5"
                           plain
                           @click="loadToggleWatched"
                           :loading="loadingScrobble"
                           icon v-bind="attrs"
                           v-on="on">
                        <v-icon v-if="watched">mdi-checkbox-marked-circle-outline</v-icon>
                        <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
                    </v-btn>
                </template>
                <span>Mark as <span v-if="watched">un</span>watched</span>
            </v-tooltip>
            <media-item-menu :item="item"/>
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import MediaItemMenu from "@/components/MediaItemMenu";

export default {
    name: "DataPlay",
    components: {MediaItemMenu},
    props: {
        item: {
            type: Object,
            default: null,
        },
    },
    data: () => ({
        loadingScrobble: false,
    }),
    methods: {
        async loadToggleWatched() {
            this.loadingScrobble = true;
            await this.toggleWatched(this.item);
            this.loadingScrobble = false;
        },
        ...mapActions(['toggleWatched']),
    },
    computed: {
        watched() {
            return this.itemWatched(this.item);
        },
        ...mapGetters(['itemWatched']),
    },
}
</script>

<style scoped>
.episode-buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>