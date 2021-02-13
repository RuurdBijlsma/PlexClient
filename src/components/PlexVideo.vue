<template>
    <div class="plex-video">
        <vlc-video :src="src"
                   v-if="usePlayer === 'vlc'"
                   class="video"
                   ref="vlc"
                   :width="bigScreen ? 0 : 'auto'"
                   @loadeddata="loadedData"
                   @timeupdate="timeUpdate"
                   @volumechange="volumeChange"
                   @canplay="canPlay"
                   @playing="canPlay"
                   @waiting="buffering"
                   @play="playEvent"
                   @pause="pauseEvent"
                   hide-buffering
                   disable-auto-hide-cursor
                   enable-context-menu
                   autoplay
                   :poster="artUrl"
                   :dark="$vuetify.theme.dark"/>
        <video ref="hls"
               @loadeddata="loadedData"
               @timeupdate="timeUpdate"
               @volumechange="volumeChange"
               @canplay="canPlay"
               @playing="canPlay"
               @waiting="buffering"
               @play="playEvent"
               @pause="pauseEvent"
               @progress="updateBuffers"
               :style="{
                   backgroundImage: hidePoster ? '' : `url(${artUrl})`,
               }"
               autoplay
               v-else-if="usePlayer === 'hls'"
               class="video"/>
    </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import Utils from "@/js/Utils";
import Hls from "hls.js";

const vlcComponent = Utils.isElectron ? {VlcVideo: require('./vlc-video/VlcVideo').default} : {};

export default {
    name: "PlexVideo",
    components: {...vlcComponent},
    data: () => ({
        hlsPlayer: null,
        player: null,
        hidePoster: false,
    }),
    beforeDestroy() {
        if (this.usePlayer === 'hls')
            this.hlsPlayer.destroy();
    },
    mounted() {
        this.player = this.getPlayer();
        console.log("Mounted plex video");
        // this.hlsPlayer.startPosition = 0;
        console.log("HLS SUPPORTED", Hls.isSupported())
        console.log("Ratio from item", this.item?.Media?.[0]?.aspectRatio)
        this.$store.commit('videoRatio', this.item?.Media?.[0]?.aspectRatio ?? 16 / 9);

        console.log({
            item: this.item,
            src: this.src,
            usedPlayer: this.usePlayer,
            platform: this.platformType,
            player: this.player,
            hlsPlayer: this.hlsPlayer,
        });

        if (this.player)
            this.volumeChange();
        this.initSrc();
    },
    methods: {
        getPlayer() {
            return this.usePlayer === 'vlc' ? this.$refs.vlc : this.$refs.hls;
        },
        initSrc() {
            this.$store.commit('currentTime', 0);
            this.$store.commit('duration', 0);
            if (this.src === '')
                return;
            this.$store.commit('srcLoading', true);

            if (this.usePlayer === 'hls') {
                if (this.hlsPlayer !== null) {
                    console.warn("this shouldnt happen", this.hlsPlayer, "hlsplayer is NOT null")
                }

                this.hlsPlayer = new Hls({
                    progressive: true,
                    lowLatencyMode: true,
                    maxBufferLength: 120,
                    maxBufferSize: 500,
                });

                console.log("Attaching", this.$refs.hls);
                this.hlsPlayer.attachMedia(this.$refs.hls);
                this.hlsPlayer.once(Hls.Events.MEDIA_ATTACHED, () => {
                    console.log("Init src", this.src);
                    if (this.usePlayer === 'hls') {
                        this.hlsPlayer.loadSource(this.src);
                        // this.player?.load();
                        this.hlsPlayer.once(Hls.Events.MANIFEST_PARSED, (event, data) => {
                            console.log('hls manifest loaded', data);
                        });
                    }
                });
                this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                // try to recover network error
                                console.log('fatal network error encountered, try to recover');
                                this.hlsPlayer.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('fatal media error encountered, try to recover');
                                this.hlsPlayer.recoverMediaError();
                                break;
                            default:
                                console.warn("hls fatal error, cannot recover")
                                // cannot recover
                                this.hlsPlayer.destroy();
                                break;
                        }
                    }
                });
            }
        },
        playEvent() {
            this.$store.commit('playing', true);
        },
        pauseEvent() {
            this.$store.commit('playing', false);
        },
        canPlay() {
            this.$store.commit('srcLoading', false);
        },
        buffering() {
            this.$store.commit('srcLoading', true);
        },
        loadedData() {
            console.log(this.player);
            if (this.player?.duration !== undefined && !isNaN(this.player?.duration))
                this.$store.commit('duration', this.player?.duration);
            console.log('duration', this.duration);
            console.log(this.player.videoWidth / this.player.videoHeight);
            this.$store.commit('videoRatio', this.player.videoWidth / this.player.videoHeight);
            this.hidePoster = true;
        },
        volumeChange() {
            let newVolume = this.usePlayer === 'vlc' ? this.player?.volume / 2 : this.player?.volume;
            this.$store.commit('volume', newVolume);
        },
        timeUpdate() {
            if (this.player?.duration !== undefined && !isNaN(this.player?.duration))
                this.$store.commit('duration', this.player?.duration);
            if (this.player?.currentTime !== undefined && !isNaN(this.player?.currentTime))
                this.$store.commit('currentTime', this.player?.currentTime);
            // console.log('time', this.progress);
        },
        updateBuffers() {
            let buffers = [];
            for (let i = 0; i < this.player?.buffered?.length; i++) {
                let start = this.player?.buffered?.start(i);
                let end = this.player?.buffered?.end(i);
                buffers.push([start / this.duration, end / this.duration]);
            }
            this.$store.commit('buffers', buffers);
        },
    },
    computed: {
        artUrl() {
            if (!this.canQuery || this.item === null)
                return '';
            console.log(this.item);
            let img = this.item.type === 'episode' ? this.item.thumb ?? this.item.art : this.item.art;
            return this.transcodeImage({
                url: img ??
                    this.item.parentArt ?? this.item.parentThumb ??
                    this.item.grandparentArt ?? this.item.grandparentThumb,
                width: this.bigScreen ? 1920 : this.videoWidth,
                height: this.bigScreen ? 1080 : this.videoHeight,
            });
        },
        src() {
            let src;
            if (this.item === null || !this.canQuery)
                src = '';
            else if (this.usePlayer === 'vlc') {
                // return original part url
                src = this.originalMkv(this.item);
            } else {
                src = this.originalHls(this.item);
            }
            console.log('src', src);
            return src;
        },
        bigScreen() {
            return this.$route.query.player === '1';
        },
        ...mapGetters(['originalHls', 'originalMkv', 'originalDash', 'canQuery',
            'transcodeImage', 'usePlayer', 'videoWidth', 'videoHeight']),
        ...mapState({
            platformType: state => state.platform.type,
            item: state => state.media.context.item,
        }),
    },
    watch: {
        player() {
            this.volumeChange();
        },
    }
}
</script>

<style scoped>
.plex-video {
    background-color: black;
}

.video {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
</style>