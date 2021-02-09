<template>
    <div class="playlists">
        <h3 class="mb-7">Playlists</h3>
        <media-item :size="170 * uiScale" sort-prop="duration"
                    class="playlist-item"
                    v-for="playlist in playlists" :key="playlist.guid"
                    :item="playlist"/>
    </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import MediaItem from "@/components/MediaItem";

export default {
    name: "Playlists",
    components: {MediaItem},
    async mounted() {
        await this.$store.restored;
        this.init().then();
    },
    methods: {
        async init() {
            this.updatePlaylists().then();
            console.log(this.playlists);
        },
        ...mapActions(['updatePlaylists', 'updateSections']),
    },
    computed: {
        playlists() {
            return this.$store.state.plex.content?.['playlists'];
        },
        ...mapState({
            uiScale: state => state.uiScale,
        }),
    },
}
</script>

<style scoped>
.playlists {
    padding: 20px 65px;
}

.playlist-item {
    margin-right: 30px;
    margin-bottom: 20px;
}
</style>