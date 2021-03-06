<template>
    <div class="plex-video">
        <mpv-video :src="src"
                   v-if="usePlayer === 'mpv'"
                   class="video"
                   ref="mpv"
                   :width="0"
                   :start-time="startTime"
                   @loadeddata="loadedData"
                   @timeupdate="timeUpdate"
                   @volumechange="volumeChange"
                   @durationchange="durationChange"
                   @canplay="canPlay"
                   @playing="canPlay"
                   @waiting="buffering"
                   @play="playEvent"
                   @pause="pauseEvent"
                   @ended="endedEvent"
                   hide-buffering
                   disable-auto-hide-cursor
                   enable-context-menu
                   :autoplay="playOnLoad"
                   :poster="artUrl"
                   cover-poster
                   :dark="$vuetify.theme.dark"/>
        <video ref="hls"
               :autoplay="playOnLoad"
               @loadeddata="loadedData"
               @timeupdate="timeUpdate"
               @durationchange="durationChange"
               @volumechange="volumeChange"
               @canplay="canPlay"
               @playing="canPlay"
               @waiting="buffering"
               @play="playEvent"
               @pause="pauseEvent"
               @ended="endedEvent"
               @progress="updateBuffers"
               :style="{
                   backgroundImage: hidePoster ? '' : `url(${artUrl})`,
               }"
               v-else-if="usePlayer === 'hls'"
               class="video"/>
    </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import Utils from "@/js/Utils";
import Hls from "hls.js";

const mpvComponent = Utils.isElectron ? {MpvVideo: require('mpv-video').default} : {};

export default {
    name: "PlexVideo",
    components: {...mpvComponent},
    data: () => ({
        startTime: 0,
        lastTimelineUpdate: 0,
        hlsPlayer: null,
        player: null,
        hidePoster: false,
        dontWatchTime: false,
        dontWatchPlaying: false,
        dontWatchVolume: false,
        markedWatched: false,
        destroyed: false,
        playbackInterval: -1,
        src: '',
        ignoreTimeUpdate: true,
    }),
    beforeDestroy() {
        this.$store.commit('currentTime', 0);
        this.$store.commit('duration', 0);
        this.$store.commit('buffers', []);

        clearInterval(this.playbackInterval);

        if (this.usePlayer === 'hls')
            this.hlsPlayer.destroy();
    },
    mounted() {
        this.player = this.getPlayer();
        this.player.muted = this.muted;
        this.player.volume = this.volume;
        this.$store.commit('playbackTime', 0);
        this.playbackInterval = setTimeout(() => {
            if (this.playing)
                this.$store.commit('playbackTime', this.playbackTime + 1);
        }, 1000);

        // this.hlsPlayer.startPosition = 0;
        this.$store.commit('videoRatio', this.item?.Media?.[0]?.aspectRatio ?? 16 / 9);

        this.updateSrcFromItem();

        if (this.player)
            this.volumeChange();
        this.initSrc();
    },
    methods: {
        getPlayer() {
            return this.usePlayer === 'mpv' ? this.$refs.mpv : this.$refs.hls;
        },
        initSrc() {
            this.$store.commit('duration', this.item.duration / 1000 ?? 0);
            if (this.src === '')
                return;
            this.$store.commit('srcLoading', true);

            // if (this.startTime !== this.currentTime) {
            //     this.ignoreTimeUpdate = true;
            //     this.$store.commit('currentTime', this.startTime);
            // }

            if (this.usePlayer === 'hls') {
                if (this.hlsPlayer !== null) {
                    console.warn("this shouldn't happen", this.hlsPlayer, "hlsplayer is NOT null")
                }

                this.hlsPlayer = new Hls({
                    startPosition: this.startTime,
                    progressive: true,
                    lowLatencyMode: true,
                    maxBufferLength: 120,
                    maxBufferSize: 500,
                });

                this.hlsPlayer.attachMedia(this.$refs.hls);
                this.hlsPlayer.once(Hls.Events.MEDIA_ATTACHED, () => {
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
        togglePlay() {
            if (this.bigScreen) {
                this.$store.commit('playing', !this.playing);
                this.updateTimeline();
            }
        },
        playEvent() {
            if (!this.playing) {
                this.dontWatchPlaying = true;
                this.$store.commit('playing', true);
                this.updateTimeline();
            }
        },
        pauseEvent() {
            if (this.playing) {
                this.dontWatchPlaying = true;
                this.$store.commit('playing', false);
                this.updateTimeline();
            }
        },
        endedEvent() {
            this.$emit('ended');
        },
        canPlay() {
            this.$store.commit('srcLoading', false);
        },
        buffering() {
            this.$store.commit('srcLoading', true);
        },
        loadedData() {
            if (this.player?.duration !== undefined && !isNaN(this.player?.duration))
                this.$store.commit('duration', this.player?.duration);
            this.$store.commit('videoRatio', this.player.videoWidth / this.player.videoHeight);
            this.hidePoster = true;

            if (this.usePlayer === 'mpv') {
                if (this.playOnLoad) {
                    this.$store.commit('playing', true);
                }
                this.player.$once('canplaythrough', () => this.$store.commit('playOnLoad', false));
            }
        },
        volumeChange() {
            this.$store.commit('volume', this.player?.volume);
        },
        timeUpdate() {
            if (this.player?.currentTime !== undefined && !isNaN(this.player?.currentTime)) {
                if (this.player.currentTime === 0 && this.item.viewOffset && this.ignoreTimeUpdate)
                    return;
                this.ignoreTimeUpdate = false;
                this.dontWatchTime = true;
                this.$store.commit('currentTime', this.player?.currentTime);
            }
        },
        durationChange() {
            if (this.player?.duration !== undefined && !isNaN(this.player?.duration))
                this.$store.commit('duration', this.player?.duration);
        },
        updateBuffers() {
            let buffers = [];
            for (let i = 0; i < this.player?.buffered?.length; i++) {
                let start = this.player?.buffered?.start(i);
                let end = this.player?.buffered?.end(i);
                buffers.push([start, end]);
            }
            this.$store.commit('buffers', buffers);
        },
        updateSrcFromItem() {
            let src;
            if (this.item === null || !this.canQuery)
                src = '';
            else if (this.usePlayer === 'mpv') {
                // return original part url
                src = this.originalMkv(this.item);
            } else {
                src = this.originalHls(this.item);
            }

            let startTime = 0;
            if (this.initialLoad) {
                startTime = this.currentTime;
                this.$store.commit("initialLoad", false);
            } else {
                let startPosition = this.item.viewOffset / 1000;
                if (!isNaN(startPosition)) {
                    startTime = startPosition;
                }
            }
            this.startTime = startTime;

            setTimeout(() => {
                this.src = src;
            }, 100);
        },
        ...mapActions(['markWatched', 'updateTimeline', 'updateMediaData']),
    },
    computed: {
        artUrl() {
            if (!this.canQuery || this.item === null)
                return '';
            let img = this.item.type === 'episode' ? this.item.thumb ?? this.item.art : this.item.art;
            return this.transcodeImage({
                url: img ??
                    this.item.parentArt ?? this.item.parentThumb ??
                    this.item.grandparentArt ?? this.item.grandparentThumb,
                width: this.bigScreen ? 1920 : this.videoWidth,
                height: this.bigScreen ? 1080 : this.videoHeight,
            });
        },
        bigScreen() {
            return this.$route.query.player === '1';
        },
        ...mapGetters([
            'originalHls', 'originalMkv', 'originalDash', 'canQuery',
            'transcodeImage', 'usePlayer', 'videoWidth', 'videoHeight', 'itemWatched'
        ]),
        ...mapState({
            platformType: state => state.platform.type,
            item: state => state.media.context.item,
            playing: state => state.media.playing,
            currentTime: state => state.media.currentTime,
            duration: state => state.media.duration,
            volume: state => state.media.volume,
            muted: state => state.media.muted,
            playOnLoad: state => state.media.playOnLoad,
            playbackTime: state => state.media.playbackTime,
            initialLoad: state => state.media.initialLoad,
            srcLoading: state => state.media.srcLoading,
        }),
    },
    watch: {
        player() {
            this.volumeChange();
        },
        currentTime(n, o) {
            if (!this.markedWatched && this.currentTime / this.duration > 0.75) {
                this.markedWatched = true;
                this.markWatched(this.item.ratingKey);
            }

            if (Math.abs(this.lastTimelineUpdate - this.currentTime) > 10) {
                this.lastTimelineUpdate = this.currentTime;
                this.updateTimeline();
            }

            if (this.dontWatchTime) this.dontWatchTime = false;
            else if (n !== o) {
                this.player.currentTime = this.currentTime;
            }
        },
        srcLoading() {
        },
        playing(n, o) {
            if (this.dontWatchPlaying) return this.dontWatchPlaying = false;
            if (n !== o) {
                if (n) {
                    this.player.play();
                } else {
                    this.player.pause();
                }
            }
        },
        volume(n, o) {
            if (n !== o) this.player.volume = n;
        },
        muted(n, o) {
            if (n !== o) this.player.muted = this.muted;
        },
    },
}
</script>

<style scoped>
.plex-video {
    background-color: black;
}

.video {
    cursor: pointer !important;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
</style>
