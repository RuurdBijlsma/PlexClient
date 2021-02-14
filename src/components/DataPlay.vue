<template>
    <div class="episode-buttons">
        <play-fab class="play-button" :item="item" text/>
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
import {mapActions, mapGetters, mapState} from "vuex";
import MediaItemMenu from "@/components/MediaItemMenu";
import PlayFab from "@/components/PlayFab";

export default {
    name: "DataPlay",
    components: {PlayFab, MediaItemMenu},
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
            let override = this.watchedKeys[this.item.ratingKey];
            if (override !== undefined)
                return override;
            return this.itemWatched(this.item);
        },
        ...mapGetters(['itemWatched']),
        ...mapState({
            watchedKeys: state => state.plex.watchedKeys,
        }),
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

.play-button {
    width: 110px;
}
</style>