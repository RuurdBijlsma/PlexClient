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
                   @durationchange="durationChange"
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
               @progress="updateBuffers"
               :style="{
                   backgroundImage: hidePoster ? '' : `url(${artUrl})`,
               }"
               v-else-if="usePlayer === 'hls'"
               class="video"/>
        <audio :src="`empty.mp3`" v-if="usePlayer === 'vlc'" loop
               ref="audioPlayer"/>
    </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import Utils from "@/js/Utils";
import Hls from "hls.js";

const vlcComponent = Utils.isElectron ? {VlcVideo: require('./vlc-video/VlcVideo').default} : {};

export default {
    name: "PlexVideo",
    components: {...vlcComponent},
    data: () => ({
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
        console.log("current time at mount", this.currentTime);

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
        updateAudioPlayer() {
            let ap = this.$refs.audioPlayer;
            let playing = this.playing && !this.srcLoading;
            if (playing && ap.paused)
                ap.play();
            else if (!playing && !ap.paused)
                ap.pause();
        },
        getPlayer() {
            return this.usePlayer === 'vlc' ? this.$refs.vlc : this.$refs.hls;
        },
        initSrc() {
            this.$store.commit('duration', this.item.duration / 1000 ?? 0);
            if (this.src === '')
                return;
            this.$store.commit('srcLoading', true);

            if (this.usePlayer === 'hls') {
                if (this.hlsPlayer !== null) {
                    console.warn("this shouldnt happen", this.hlsPlayer, "hlsplayer is NOT null")
                }
                let startPosition = this.item.viewOffset / 1000;
                if (isNaN(startPosition))
                    startPosition = this.currentTime;

                this.hlsPlayer = new Hls({
                    startPosition: startPosition,
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
        canPlay() {
            this.$store.commit('srcLoading', false);
        },
        buffering() {
            this.$store.commit('srcLoading', true);
        },
        loadedData() {
            if (this.player?.duration !== undefined && !isNaN(this.player?.duration))
                this.$store.commit('duration', this.player?.duration);
            console.log('duration', this.duration);
            this.$store.commit('videoRatio', this.player.videoWidth / this.player.videoHeight);
            this.hidePoster = true;
            console.log("VIEW OFFSET", this.item, this.item.viewOffset);
            if (this.usePlayer === 'vlc') {
                this.$store.commit('currentTime', this.item.viewOffset / 1000 ?? this.currentTime);
                if (this.playOnLoad) {
                    this.$refs.audioPlayer.play();
                    this.player.play();
                } else {
                    this.$refs.audioPlayer.pause();
                    this.player.pause();
                }
            }
            setTimeout(() => this.$store.commit('playOnLoad', false), 100);
        },
        volumeChange() {
            this.dontWatchVolume = true;
            this.$store.commit('volume', this.player?.volume);
        },
        timeUpdate() {
            if (this.player?.currentTime !== undefined && !isNaN(this.player?.currentTime)) {
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
        ...mapActions(['markWatched', 'updateTimeline']),
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
                console.log('set timeline')
                this.updateTimeline();
            }

            if (this.dontWatchTime) this.dontWatchTime = false;
            else if (n !== o) this.player.currentTime = this.currentTime;
        },
        srcLoading() {
            this.updateAudioPlayer();
        },
        playing(n, o) {
            this.updateAudioPlayer();
            if (this.dontWatchPlaying) return this.dontWatchPlaying = false;
            if (n !== o) {
                if (n) {
                    this.$refs.audioPlayer.play();
                    this.player.play();
                } else {
                    this.$refs.audioPlayer.pause();
                    this.player.pause();
                }
            }
        },
        volume(n, o) {
            if (this.dontWatchVolume) return this.dontWatchVolume = false;
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
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
</style>