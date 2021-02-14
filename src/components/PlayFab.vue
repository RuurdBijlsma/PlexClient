<template>
    <v-btn v-if="item"
           :loading="isLoading"
           @click.prevent="togglePlay"
           :rounded="text"
           :elevation="text ? 0 : ''"
           small
           :x-small="xSmall"
           :fab="!text"
           color="primary">
        <v-icon v-if="isPlaying" :class="{'mr-2': text}">mdi-pause</v-icon>
        <v-icon v-else :class="{'mr-2': text}">mdi-play</v-icon>
        <span v-if="text && isPlaying">Pause</span>
        <span v-else-if="text">Play</span>
    </v-btn>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";

export default {
    name: "PlayFab",
    props: {
        item: {
            type: Object,
            default: null,
        },
        text: {
            type: Boolean,
            default: false,
        },
        xSmall: {
            type: Boolean,
            default: false,
        },
        playlist: {
            type: Object,
            default: null,
        },
    },
    methods: {
        togglePlay() {
            if (!this.isActive)
                this.playItem({item: this.item, containingPlaylist: this.playlist})
            else {
                if (this.isPlaying)
                    this.$store.commit('playing', false);
                else
                    this.$store.commit('playing', true);
            }
        },
        ...mapActions(['playItem']),
    },
    computed: {
        isLoading() {
            return this.isActive && (this.srcLoading || this.queueLoading);
        },
        isPlaying() {
            return this.isActive && this.playing;
        },
        isActive() {
            return this.itemIsActive(this.item);
        },
        ...mapGetters(['itemIsActive']),
        ...mapState({
            srcLoading: state => state.media.srcLoading,
            playing: state => state.media.playing,
            queueLoading: state => state.media.context.queueLoading,
        }),
    }
}
</script>

<style scoped>

</style>