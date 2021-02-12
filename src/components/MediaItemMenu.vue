<template>
    <v-menu v-if="canPlay || isParent || canWatch" :attach="attach" :nudge-top="nudgeTop">
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                :small="small"
                :plain="plain"
                @click.prevent="test"
                icon
                :dark="darkButton || dark"
                v-bind="attrs"
                v-on="on">
                <v-icon :small="small">mdi-dots-horizontal</v-icon>
            </v-btn>
        </template>
        <v-list dense :dark="dark">
            <v-list-item v-if="canPlay" @click="togglePlay">
                <v-list-item-icon>
                    <v-icon>mdi-play-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Play</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isParent" @click="shuffle">
                <v-list-item-icon>
                    <v-icon>mdi-shuffle</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Shuffle</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="canWatch" @click="toggleWatched(item)">
                <v-list-item-icon>
                    <v-icon v-if="watched">mdi-checkbox-marked-circle-outline</v-icon>
                    <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Mark <span v-if="watched">un</span>watched</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="canPlay" @click="itemDelete">
                <v-list-item-icon>
                    <v-icon>mdi-delete-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="playlist !== null" @click="removeFrom(playlist)">
                <v-list-item-icon>
                    <v-icon>mdi-playlist-minus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Remove from playlist</v-list-item-title>
            </v-list-item>
            <v-menu v-if="canWatch" offset-x>
                <template v-slot:activator="{ on, attrs }">
                    <v-list-item v-bind="attrs"
                                 @click="updatePlaylists"
                                 v-on="on">
                        <v-list-item-icon>
                            <v-icon>mdi-playlist-plus</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Add to playlist</v-list-item-title>
                    </v-list-item>
                </template>
                <v-list dense>
                    <v-list-item @click="promptCreatePlaylist">
                        <v-list-item-icon>
                            <v-icon>mdi-playlist-plus</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Add to new playlist</v-list-item-title>
                    </v-list-item>
                    <v-subheader>Add to existing playlist</v-subheader>
                    <v-list-item @click="addToExisting(playlist)" v-for="playlist in playlists">
                        <v-list-item-title>{{ playlist.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-list>
    </v-menu>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
    name: "MediaItemMenu",
    props: {
        item: {
            type: Object,
            default: null,
        },
        darkButton: {
            type: Boolean,
            default: false,
        },
        dark: {
            type: Boolean,
            default: false,
        },
        small: {
            type: Boolean,
            default: false,
        },
        plain: {
            type: Boolean,
            default: false,
        },
        playlist: {
            type: Object,
            default: null,
        },
        attach: {
            type: Object,
            default: false,
        },
        nudgeTop: {
            type: Number,
            default: 0,
        },
    },
    methods: {
        async removeFrom(playlist) {
            await this.removeFromPlaylist({
                playlistKey: playlist.ratingKey,
                playlistItemID: this.item.playlistItemID,
            });
        },
        async addToExisting(playlist) {
            let result = await this.addToPlaylist({key: this.item.ratingKey, playlistKey: playlist.ratingKey});
            console.log('add result', result);
            await this.addSnack({text: "Added to playlist", to: `/playlist/${playlist.ratingKey}`});
        },
        async promptCreatePlaylist() {
            let {confirmed, value} = await this.showTextPrompt({
                title: 'Create a playlist',
                subtitle: this.item.title,
                value: this.item.title,
                label: 'Playlist name',
                confirmText: 'Create',
            });
            if (confirmed) {
                let result = await this.createPlaylist({key: this.item.ratingKey, title: value});
                console.log("Playlist created", result);
                await this.addSnack({text: "Playlist created", to: `/playlist/${result.ratingKey}`});
            }
        },
        test() {
            console.log('test');
        },
        togglePlay() {
            console.log("togglePlay");
        },
        shuffle() {
            console.log("shuffle");
        },
        async itemDelete() {
            let confirmed = await this.showPrompt({
                title: `Are you sure you want to delete this ${this.item.type ?? 'item'}?`,
                subtitle: this.item.title,
            });
            if (confirmed) {
                await this.deleteItem(this.item);
            }
        },
        ...mapActions(['toggleWatched', 'updatePlaylists', 'showPrompt', 'addToPlaylist', 'removeFromPlaylist',
            'showTextPrompt', 'deleteItem', 'createPlaylist', 'addSnack']),
    },
    computed: {
        playlists() {
            return this.$store.state.plex.content?.['playlists'];
        },
        watched() {
            return this.itemWatched(this.item);
        },
        canPlay() {
            return ['show', 'season', 'movie', 'episode', 'playlist'].includes(this.item.type);
        },
        canWatch() {
            return ['show', 'season', 'movie', 'episode'].includes(this.item.type);
        },
        isParent() {
            return ['playlist', 'show', 'season'].includes(this.item.type);
        },
        ...mapGetters(['itemWatched']),
    },
}
</script>

<style scoped>

</style>