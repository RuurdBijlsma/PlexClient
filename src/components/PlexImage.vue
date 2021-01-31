<template>
    <v-sheet class="plex-image" :style="{
        '--width': width + 'px',
        '--height': height + 'px',
    }">
        <v-img
            class="vimg"
            :lazy-src="lazySrc"
            :src="fullSrc"
            @load="loadingImg = false"
            @error="loadingImg = true">
        </v-img>
        <div class="img-filter" :style="{
            backdropFilter: loadingImg ? `blur(10px) saturate(130%)` : `blur(0) saturate(100%)`,
            transition: `backdrop-filter ${transition}`,
        }"/>
    </v-sheet>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
    name: "PlexImage",
    props: {
        src: {
            type: String,
            default: null,
            required: true,
        },
        width: {
            type: Number,
            default: 140,
        },
        height: {
            type: Number,
            default: 140,
        },
        transitionDuration: {
            type: String,
            default: '.1s',
        },
    },
    data: () => ({
        loadingImg: true,
        lazySrc: '',
        fullSrc: '',
        transition: '',
    }),
    mounted() {
        this.transition = this.transitionDuration;
        this.setSrc();
        this.lazySrc = this.placeholderImg;
    },
    methods: {
        async setSrc() {
            if (navigator.onLine)
                this.fullSrc = this.imgUrl;
            // let offlineUrl = await this.offlinePlexImg(this.imgUrl);
            // if (offlineUrl) {
            //     this.transition = '0s';
            //     this.fullSrc = offlineUrl;
            // } else {
            //     this.fullSrc = await this.onlinePlexImg(this.imgUrl);
            // }
        },
        ...mapActions(['onlinePlexImg', 'offlinePlexImg']),
    },
    computed: {
        thumbWidth() {
            return Math.ceil(this.width / 100) * 100;
        },
        thumbHeight() {
            return Math.round(this.thumbWidth / this.aspectRatio);
        },
        imgUrl() {
            return this.transcodeUrl({
                url: this.src,
                width: Math.round(this.thumbWidth),
                height: Math.round(this.thumbHeight),
            });
        },
        placeholderImg() {
            return this.transcodeUrl({
                url: this.src,
                width: Math.round(this.thumbWidth * .05),
                height: Math.round(this.thumbHeight * .05),
            });
        },
        aspectRatio() {
            return this.width / this.height;
        },
        ...mapGetters(['transcodeUrl', 'plexUrl']),
    },
    watch: {
        imgUrl() {
            this.setSrc();
        },
    },
}
</script>

<style scoped>
.plex-image {
    width: var(--width);
    height: var(--height);
    position: relative;
    display: flex;
}

.vimg {
    width: 100%;
    height: 100%;
    position: absolute;
}

.img-filter {
    width: 100%;
    height: 100%;
    position: absolute;
}
</style>