<template>
    <div>
        <vlc-video :src="src"
                   v-if="usePlayer === 'vlc'"
                   class="video"
                   controls
                   enable-context-menu
                   :dark="$vuetify.theme.dark"
                   height="auto"
        />
        <video :src="src"
               controls
               v-else-if="usePlayer === 'video'"
               class="video"
        ></video>
    </div>
</template>

<script>
import Utils from "@/js/Utils";

let vlcComponent = Utils.isElectron ? {VlcVideo: require('./vlc-video/VlcVideo').default} : {};
import {mapGetters, mapState} from "vuex";

export default {
    name: "PlexPlayer",
    components: {...vlcComponent},
    data: () => ({}),
    props: {
        item: {
            type: Object,
            default: null,
        },
        transcode: {
            type: Object,
            default: null,
        },
    },
    async mounted() {
        await this.$store.restored;
        console.log({
            src: this.src,
            mustTranscode: this.mustTranscode,
            usedPlayer: this.usePlayer,
            isH264: this.isH264,
            platform: this.platformType,
        });
    },
    computed: {
        src() {
            if (this.mustTranscode) {
                // return transcode m3u8 url
            } else if (this.usePlayer === 'vlc') {
                // return original part url
                return this.originalVideo(this.item?.Media?.[0]?.Part?.[0]?.key);
            } else {
                // return original quality url that <video> can play
                // Audio doesn't work in <video> with the following url
                return this.originalVideo(this.item?.Media?.[0]?.Part?.[0]?.key);
            }
        },
        usePlayer() {
            if (this.mustTranscode) {
                return 'hls';
            } else if (this.platformType === 'web') {
                return 'video';
            } else {
                return 'vlc';
            }
        },
        mustTranscode() {
            return this.transcode !== null || (!this.isH264 && this.platformType === 'web');
        },
        isH264() {
            return this.item?.Media?.[0]?.videoCodec === 'h264';
        },
        ...mapGetters(['originalVideo']),
        ...mapState({
            platformType: state => state.platform.type,
        })
    },
}
</script>

<style scoped>
.video {
    width: 100%;
}
</style>