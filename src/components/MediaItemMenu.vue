<template>
    <v-menu>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                @click.prevent="test"
                icon
                :dark="dark"
                v-bind="attrs"
                v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </template>
        <v-list dense>
            <v-list-item v-if="canPlay">
                <v-list-item-icon>
                    <v-icon>mdi-play-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Play</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isParent">
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
            <v-menu v-if="canWatch" offset-x open-on-hover>
                <template v-slot:activator="{ on, attrs }">
                    <v-list-item v-bind="attrs"
                                 v-on="on">
                        <v-list-item-icon>
                            <v-icon>mdi-playlist-plus</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Add to playlist</v-list-item-title>
                    </v-list-item>
                </template>
                <v-list dense>
                    <v-list-item>
                        <v-list-item-title>playlist</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-list-item v-if="canPlay">
                <v-list-item-icon>
                    <v-icon>mdi-delete-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
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
        dark: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        test() {
            console.log('test');
        },
        togglePlay() {

        },
        ...mapActions(['toggleWatched']),
    },
    computed: {
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