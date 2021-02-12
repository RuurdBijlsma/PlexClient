<template>
    <div ref="playerContainer"
         :class="{
             'electron': platformType === 'electron',
             'big-screen': bigScreen,
             'small-screen': !bigScreen,
             'hide-controls': hideControls && bigScreen && !mouseOnControls && playing,
         }"
         :style="{
            '--controlsHeight': controlsHeight + 'px',
            '--videoWidth': videoWidth + 'px',
            '--videoHeight': videoHeight + 'px',
            '--seekProgress': Math.round(progress * 10000) / 100 + '%',
        }">
        <div v-if="bigScreen && !fullscreen" class="player-app-bar">
            <div class="player-app-bar-content">
                <v-btn icon dark small class="no-drag" @click="exitBigScreen">
                    <v-icon small>mdi-chevron-down</v-icon>
                </v-btn>
                <template v-if="platformType === 'electron'">
                    <v-spacer></v-spacer>
                    <v-btn icon dark small class="no-drag">
                        <v-icon small>mdi-minus</v-icon>
                    </v-btn>
                    <v-btn icon dark small class="no-drag">
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </template>
            </div>
        </div>
        <div class="video-container" @click="enterBigScreen" @dblclick="toggleFullscreen">
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
                   v-else-if="usePlayer === 'hls'"
                   class="video"/>
        </div>
        <v-sheet :color="bigScreen ? 'transparent' : 'default'"
                 :dark="bigScreen"
                 elevation="4"
                 @mouseenter="mouseOnControls = true"
                 @mouseleave="mouseOnControls = false"
                 class="plex-player">
            <div class="top-controls ml-4 mt-4">
                <div class="plex-media-info">
                    <template v-if="item.type==='episode'">
                        <router-link :to="`/show/${item.grandparentRatingKey}`" no-style>
                            {{ item.grandparentTitle }}
                        </router-link>
                        <router-link :to="`/episode/${item.ratingKey}`" no-style>{{ item.title }}</router-link>
                        <episode-link :item="item"/>
                    </template>
                    <template v-else>
                        <router-link :to="`/movie/${item.ratingKey}`" no-style>{{ item.title }}</router-link>
                        <router-link :to="`/library/${item.librarySectionID}/all?filter=year~${item.ratingKey}`"
                                     no-style>{{ item.year }}
                        </router-link>
                    </template>
                </div>
                <div class="plex-volume mr-5">
                    <v-slider @click:prepend="toggleMute"
                              :max="1" :min="0" :step="0.01"
                              dense
                              v-model="volume"
                              :prepend-icon="volumeIcon"
                              hide-details="auto" class="plex-volume-slider"></v-slider>
                </div>
            </div>
            <div class="middle-controls ml-4">
                <span>{{ niceCurrentTime }} / {{ niceDuration }}</span>
                <div class="seek-controls" @mousedown="handleMouseDown">
                    <v-sheet class="plex-seek-bg" ref="seekBg" :color="bigScreen ? '#292929' : 'softerBackground'">
                        <v-sheet class="plex-seek-progress" :color="bigScreen ? 'white' : 'primary'"/>
                        <v-sheet class="plex-buffer" color="#868686" v-for="buffer in buffers" :style="{
                            left: Math.round(buffer[0] * 1000) / 10 + '%',
                            width: Math.round((buffer[1] - buffer[0]) * 1000) / 10 + '%',
                        }"/>
                        <v-sheet class="plex-seek-thumb" :color="bigScreen ? 'white' : 'primary'"/>
                    </v-sheet>
                </div>
            </div>
            <div class="bottom-controls ml-4 mt-1">
                <div class="left-control-buttons">
                    <v-btn icon small>
                        <v-icon small>mdi-skip-previous</v-icon>
                    </v-btn>
                    <v-btn icon small @click="seekBy(-10)">
                        <v-icon small>mdi-skip-backward</v-icon>
                    </v-btn>
                    <v-btn icon @click="togglePlay" :loading="loadingSrc">
                        <v-icon v-if="playing">mdi-pause</v-icon>
                        <v-icon v-else>mdi-play</v-icon>
                    </v-btn>
                    <v-btn icon small @click="seekBy(10)">
                        <v-icon small>mdi-skip-forward</v-icon>
                    </v-btn>
                    <v-btn icon small>
                        <v-icon small>mdi-skip-next</v-icon>
                    </v-btn>
                </div>
                <div class="right-control-buttons mr-5">
                    <v-btn icon small plain>
                        <v-icon small>mdi-repeat</v-icon>
                    </v-btn>
                    <v-btn icon small plain>
                        <v-icon small>mdi-shuffle</v-icon>
                    </v-btn>
                    <v-btn icon small plain>
                        <v-icon small>mdi-playlist-play</v-icon>
                    </v-btn>
                    <media-item-menu attach=".plex-player"
                                     :dark="bigScreen"
                                     :item="item"
                                     :nudge-top="140"></media-item-menu>
                </div>
            </div>
        </v-sheet>
    </div>
</template>

<script>
import Utils from "@/js/Utils";
import Hls from 'hls.js';
import {mapGetters, mapState} from "vuex";
import EpisodeLink from "@/components/EpisodeLink";
import MediaItemMenu from "@/components/MediaItemMenu";

let vlcComponent = Utils.isElectron ? {VlcVideo: require('./vlc-video/VlcVideo').default} : {};

export default {
    name: "PlexPlayer",
    components: {MediaItemMenu, EpisodeLink, ...vlcComponent},
    data: () => ({
        hlsPlayer: new Hls({
            progressive: true,
            lowLatencyMode: true,
            maxBufferLength: 120,
            maxBufferSize: 500,
        }),
        videoRatio: 16 / 9,
        controlsHeight: 150,
        mouseDown: false,
        seekBounds: null,
        loadingSrc: false,
        fullscreen: false,
        mouseOnControls: false,
        moveTimeout: -1,
        hideControls: false,

        buffers: [],
        duration: 0,
        currentTime: 0,
        volume: 1,
        muted: false,
        playing: false,
    }),
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
    beforeDestroy() {
        this.hlsPlayer.destroy();
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('fullscreenchange', this.changeFullscreen);
    },
    async mounted() {
        await this.$store.restored;
        // this.hlsPlayer.startPosition = 0;

        console.log({
            item: this.item,
            src: this.src,
            usedPlayer: this.usePlayer,
            platform: this.platformType,
            player: this.player,
            hlsPlayer: this.hlsPlayer,
        });
        this.volumeChange();

        if (this.usePlayer === 'hls') {
            this.hlsPlayer.attachMedia(this.$refs.hls);
            this.hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, () => {
                this.initSrc();
            });
            this.hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
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
                            // cannot recover
                            this.hlsPlayer.destroy();
                            break;
                    }
                }
            });
        }
        document.addEventListener('mousemove', this.handleMouseMove, false);
        document.addEventListener('mouseup', this.handleMouseUp, false);
        document.addEventListener('fullscreenchange', this.changeFullscreen, false);
    },
    methods: {
        toggleFullscreen() {
            if (this.fullscreen) {
                document.exitFullscreen();
            } else {
                let container = this.$refs.playerContainer;
                container.requestFullscreen();
            }
        },
        changeFullscreen() {
            this.fullscreen = document.fullscreenElement === this.$refs.playerContainer;
        },
        updateBuffers() {
            let buffers = [];
            for (let i = 0; i < this.player.buffered.length; i++) {
                let start = this.player.buffered.start(i);
                let end = this.player.buffered.end(i);
                buffers.push([start / this.duration, end / this.duration]);
            }
            this.buffers = buffers;
        },
        enterBigScreen() {
            if (!this.bigScreen)
                this.$router.push({query: {...this.$route.query, player: 1}});
        },
        exitBigScreen() {
            if (this.bigScreen)
                this.$router.push({query: {...this.$route.query, player: 0}});
        },
        togglePlay() {
            if (this.playing) {
                console.log("pause() player");
                this.player.pause();
            } else {
                console.log("play() player");
                this.player.play();
            }
        },
        seekBy(seconds) {
            this.seekTo(this.currentTime + seconds);
        },
        seekTo(seconds) {
            this.currentTime = seconds;
            this.player.currentTime = seconds;
        },
        playEvent() {
            console.log('recieved play event');
            this.playing = true;
        },
        pauseEvent() {
            console.log('recieved pause event');
            this.playing = false;
        },
        canPlay() {
            this.loadingSrc = false;
        },
        buffering() {
            this.loadingSrc = true;
        },
        loadedData() {
            this.duration = this.player.duration;
            console.log('duration', this.duration);
        },
        volumeChange() {
            this.volume = this.usePlayer === 'vlc' ? this.player.volume / 2 : this.player.volume;
        },
        timeUpdate() {
            this.currentTime = this.player.currentTime;
            // console.log('time', this.progress);
        },
        handleMouseDown(e) {
            this.seekBounds = this.$refs.seekBg.$el.getBoundingClientRect();
            this.mouseDown = true;
            this.handleMouseMove(e);
        },
        handleMouseMove(e) {
            if (e.movementX > 1 || e.movementY > 1) {
                this.hideControls = false;
                clearTimeout(this.moveTimeout);
                this.moveTimeout = setTimeout(() => {
                    this.hideControls = true;
                }, 2500);
            }
            if (this.mouseDown) {
                let x = e.pageX - this.seekBounds.left;
                let progress = Math.min(1, Math.max(0, x / this.seekBounds.width));
                console.log("set progress", progress, this.duration);
                this.seekTo(this.duration * progress);
            }
        },
        handleMouseUp() {
            if (this.mouseDown)
                this.mouseDown = false;
        },
        toggleMute() {
            this.muted = !this.muted;
        },
        initSrc() {
            this.loadingSrc = true;
            if (this.usePlayer === 'hls') {
                this.hlsPlayer.loadSource(this.src);
                this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    console.log('hls manifest loaded', data);
                });
            }
        },
    },
    computed: {
        niceCurrentTime() {
            return Utils.msToTime(this.currentTime * 1000, false);
        },
        niceDuration() {
            return Utils.msToTime(this.duration * 1000, false);
        },
        progress() {
            return this.currentTime / (this.duration > 0 ? this.duration : 1);
        },
        volumeIcon() {
            if (this.muted)
                return 'mdi-volume-mute';
            return 'mdi-volume-high';
        },
        videoWidth() {
            return this.videoHeight * this.videoRatio;
        },
        videoHeight() {
            return this.controlsHeight - 10;
        },
        player() {
            return this.usePlayer === 'vlc' ? this.$refs.vlc : this.$refs.hls;
        },
        src() {
            if (this.usePlayer === 'vlc') {
                // return original part url
                return this.originalMkv(this.item);
            } else {
                return this.originalHls(this.item);
            }
        },
        usePlayer() {
            // return 'hls';
            if (this.platformType === 'electron') {
                return 'vlc';
            } else {
                return 'hls';
            }
        },
        bigScreen() {
            return this.$route.query.player === '1';
        },
        ...mapGetters(['originalHls', 'originalMkv', 'originalDash']),
        ...mapState({
            platformType: state => state.platform.type,
        }),
    },
    watch: {
        '$route.query.player'() {
            console.log('bigscreen change');
            if (!this.bigScreen && this.fullscreen) {
                console.log('exiting fullscreen');
                document.exitFullscreen();
            }
        },
        muted(n, o) {
            if (n !== o) this.player.muted = this.muted;
        },
        volume(newV, oldV) {
            if (newV !== oldV) {
                this.player.volume = this.usePlayer === 'vlc' ? newV * 2 : newV;
            }
        },
        src() {
            this.initSrc();
        },
    },
}
</script>

<style scoped>
.player-app-bar {
    position: fixed;
    z-index: 52;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    backdrop-filter: blur(30px) saturate(80%) brightness(80%);
    transition: opacity 0.1s;
}

.hide-controls .player-app-bar {
    opacity: 0;
}

.electron .player-app-bar {
    background-color: rgba(60, 60, 60, 0.2);
}

.player-app-bar-content {
    margin: 5px;
    height: 30px;
    width: calc(100% - 10px);
    display: flex;
    align-items: center;
    padding: 0 10px;
    -webkit-app-region: drag;
}

.no-drag, .no-drag >>> * {
    -webkit-app-region: no-drag;
}

.plex-player {
    position: fixed;
    width: 100%;
    max-width: 1000px;
    height: var(--controlsHeight);
    bottom: 20px;
    left: calc(50% - 500px);
    border-radius: 7px;
    padding-left: calc(var(--videoWidth) + 10px);
    transition: 0.5s, opacity 0.1s;
    z-index: 49;

    display: flex;
    flex-direction: column;
}

.hide-controls .plex-player {
    opacity: 0;
}

.big-screen .plex-player {
    backdrop-filter: blur(50px) saturate(80%) brightness(80%);
    background-image: linear-gradient(to top, rgba(20, 20, 20, 0.4), rgba(20, 20, 20, 0.2));
    z-index: 51;
    padding-left: 10px;
    max-width: 600px;
    left: calc(50% - 300px);
}

.video-container {
    position: fixed;
    bottom: 25px;
    left: calc(50% - 500px + 5px);
    height: var(--videoHeight);
    width: var(--videoWidth);
    border-radius: 5px;
    overflow: hidden;
    /*box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.3);*/
    transition: 0.5s;
    z-index: 50;
    background-color: transparent;
}

.small-screen .video-container {
    cursor: pointer !important;
}

.big-screen .video-container {
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
    border-radius: 0;
    background-color: #000000;
}

@media (max-width: 1100px) {
    .small-screen .plex-player {
        left: 0;
        bottom: 0;
        border-radius: 0;
        max-width: 1100px;
    }

    .small-screen .video-container {
        left: 5px;
        bottom: 5px;
    }
}

@media (max-width: 700px) {
    .big-screen .plex-player {
        left: 0;
        bottom: 0;
        border-radius: 0;
        max-width: 700px;
    }
}

.video {
    width: 100%;
    height: 100%;
}

.hide-controls .video {
    cursor: none !important;
}

.top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.plex-media-info {
    display: flex;
    flex-direction: column;
    font-size: 14px;
}

.plex-volume-slider {
    width: 120px;
    transform: scale(0.8);
}

.middle-controls {
    display: flex;
    align-items: center;
}

.middle-controls > span {
    width: 130px;
    font-size: 13px;
    opacity: 0.7;
}

.seek-controls {
    width: 100%;
    margin-right: 25px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.plex-seek-bg {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    position: relative;
}

.plex-seek-progress {
    height: 100%;
    border-bottom-left-radius: 2px;
    border-top-left-radius: 2px;
    width: var(--seekProgress);
}

.plex-buffer {
    position: absolute;
    height: 4px;
    top: 0;
    opacity: 0.3;
}

.plex-seek-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    position: relative;
    top: -7px;
    left: calc(var(--seekProgress) - 5px);
}

.bottom-controls {
    display: flex;
    justify-content: space-between;
}

.left-control-buttons > *, .right-control-buttons > * {
    margin: 0 3px;
}
</style>