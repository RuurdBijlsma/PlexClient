<template>
    <div v-if="item" class="media-item" :style="{
        '--width': width + 'px',
        '--height': height + 'px',
    }">
        <div>
            <plex-image v-if="item.thumb" class="img" :width="imgWidth" :height="imgHeight" :src="item.thumb"></plex-image>
            <v-icon v-else-if="item.type === 'folder'">mdi-folder</v-icon>
        </div>
        <div class="item-bottom">
            <router-link class="item-title" to="/" :title="item.title">{{ item.title }}</router-link>
        </div>
    </div>
</template>

<script>
import PlexImage from "@/components/PlexImage";

export default {
    name: "MediaItem",
    components: {PlexImage},
    props: {
        item: {
            type: Object,
            default: null,
        },
        size: {
            type: Number,
            default: 130,
        }
    },
    computed: {
        imgWidth() {
            return this.size;
        },
        imgHeight() {
            return this.size / this.aspectRatio;
        },
        width() {
            return this.size;
        },
        height() {
            return this.imgHeight + 30;
        },
        aspectRatio() {
            return {
                'show': 10 / 15,
                'movie': 10 / 15,
            }[this.item.type]
        },
    }
}
</script>

<style scoped>
.media-item {
    display: inline-flex;
    position: relative;
    flex-direction: column;
}

.img {
    border-radius: 0.7vw;
    overflow: hidden;
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2);
}

.item-bottom {
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: var(--width);
    height: 30px;
    padding: 2px 5px 5px;
    z-index: 3;
    overflow: hidden;
}

.item-title {
    color: var(--foreground);
    text-decoration: none;
}
.item-title:hover{
    text-decoration: underline;
}

</style>