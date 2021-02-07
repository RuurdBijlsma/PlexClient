<template>
    <v-lazy>
        <div v-if="playlist" class="show">
            <div class="left-column">
                <plex-image
                    glow
                    class="ml-6"
                    rounding="10px"
                    :src="playlist.composite"
                    :width="250"
                    :height="250"/>
            </div>
            <div class="right-column">
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
            </div>
        </div>

    </v-lazy>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataDetails from "@/components/DataDetails";
import DataHeader from "@/components/DataHeader";
import DataPlay from "@/components/DataPlay";
import MediaListItem from "@/components/MediaListItem";
import BlurCard from "@/components/BlurCard";

export default {
    name: "Playlist",
    components: {BlurCard, MediaListItem, DataPlay, DataHeader, DataDetails, ItemRow, PlexImage, MediaItem},
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

.seasons {
    margin-left: -15px;
}

.season {
    margin: 8px 15px;
}

</style>