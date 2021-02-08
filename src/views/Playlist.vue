<template>
        <glow-column-page v-if="playlist"
                          :src="playlist.composite"
                          :img-width="250 * uiScale"
                          :img-height="250 * uiScale">
            <router-link no-style class="show-title" :to="`/playlist/${playlist.ratingKey}`">
                <h2>{{ playlist.title }}</h2>
            </router-link>
            <data-header :metadata="playlist"/>
            <data-play class="mt-3" :metadata="playlist"/>
            <data-details class="mt-4" :metadata="playlist"/>

            <blur-card>
                <v-list color="transparent" class="seasons">
                    <media-list-item class="season"
                                     show-duration
                                     :number="i + 1"
                                     :key="item.guid" v-for="(item, i) in items"
                                     :item="item"/>
                </v-list>
            </blur-card>
        </glow-column-page>
</template>

<script>
import {mapActions, mapState} from "vuex";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataDetails from "@/components/DataDetails";
import DataHeader from "@/components/DataHeader";
import DataPlay from "@/components/DataPlay";
import MediaListItem from "@/components/MediaListItem";
import BlurCard from "@/components/BlurCard";
import GlowColumnPage from "@/components/GlowColumnPage";

export default {
    name: "Playlist",
    components: {
        GlowColumnPage,
        BlurCard, MediaListItem, DataPlay, DataHeader, DataDetails, ItemRow, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        await this.init();
        console.log(this.playlist);
    },
    methods: {
        async init() {
            this.updatePlaylist(this.key).then(e => console.log('meta', e));
            this.updatePlaylistItems(this.key).then(e => console.log('child', e));
        },
        ...mapActions(['updatePlaylist', 'updatePlaylistItems']),
    },
    computed: {
        key() {
            return this.$route.params.key ?? '1';
        },
        playlist() {
            return this.$store.state.plex.content['playlist' + this.key];
        },
        items() {
            return this.$store.state.plex.content['playlistItems' + this.key];
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

.seasons {
    margin-left: -15px;
}

.season {
    margin: 8px 15px;
}

</style>