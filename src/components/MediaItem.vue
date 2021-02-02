<template>
    <div v-if="item" class="media-item" :style="{
        '--width': width + 'px',
        '--imgHeight': imgHeight + 'px',
    }">
        <div class="image-container">
            <plex-image v-if="item.thumb" class="img"
                        :rounding="itemRounding"
                        :width="imgWidth" :height="imgHeight"
                        :src="item.thumb"></plex-image>
            <router-link class="item-buttons" :to="to">
                <v-btn class="item-play" fab small color="primary">
                    <v-icon>mdi-play</v-icon>
                </v-btn>
                <v-btn icon dark>
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
            </router-link>
        </div>
        <div class="item-bottom" :style="{
            textAlign: itemType === 'actor' ? 'center' : 'left',
        }">
            <v-icon v-if="itemType === 'folder'" class="mr-2">mdi-folder</v-icon>
            <router-link class="item-title" :to="to" :title="itemTitle">{{ itemTitle }}</router-link>
            <div class="item-grey-text" v-for="subtitle of itemSubtitles" :title="subtitle">{{ subtitle }}</div>
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
        },
        type: {
            type: String,
            default: null,
        },
    },
    computed: {
        itemTitle() {
            return {
                'actor': this.item.tag,
            }[this.itemType] ?? this.item.title;
        },
        itemSubtitles() {
            return {
                'show': [`${this.item.childCount} seasons`],
                'movie': [this.item.year],
                'season': [`${this.item.leafCount} episodes`],
                'actor': [this.item.role?.replaceAll('|', ', ')],
            }[this.itemType] ?? [];
        },
        to() {
            return `/${this.itemType}/${this.item.ratingKey}`;
        },
        itemRounding() {
            return {
                'actor': '50%',
            }[this.itemType] ?? '0.4vw';
        },
        itemType() {
            return this.type ?? this.item.type ?? 'show';
        },
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
            return this.imgHeight + 60;
        },
        aspectRatio() {
            return {
                'show': 10 / 15,
                'movie': 10 / 15,
                'season': 10 / 15,
                'actor': 1,
            }[this.itemType] ?? 16 / 9;
        },
    }
}
</script>

<style scoped>
.media-item {
    display: inline-flex;
    position: relative;
    flex-direction: column;
    text-align: left;
}

.image-container {
    position: relative;
    width: var(--width);
    height: var(--imgHeight);
}

.img {
    position: absolute;
    overflow: hidden;
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2);
}

.item-buttons {
    opacity: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: calc(var(--width) / 10);
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    align-items: flex-end;
    /*background-color: rgba(0, 0, 0, 0.4);*/
    transition: opacity 0.15s;
    cursor: pointer;
    text-decoration: none;
}

.item-buttons:hover {
    opacity: 1;
}

.item-bottom {
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: var(--width);
    padding: 4px 5px 5px;
    z-index: 3;
    overflow: hidden;
}

.item-title {
    color: var(--foreground);
    text-decoration: none;
    font-weight: 400;
}

.item-title:hover {
    text-decoration: underline;
}

.item-grey-text {
    opacity: 0.7;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width:100%;
}

</style>