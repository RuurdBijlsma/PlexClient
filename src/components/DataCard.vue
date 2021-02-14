<template>
    <div class="main-deck mt-3" v-if="item" :style="{
                '--imgHeight': Math.round(imgHeight) + 'px',
                '--imgWidth': Math.round(imgWidth) + 'px',
                backdropFilter: `blur(40px) brightness(${$vuetify.theme.dark ? '150' : '110'}%) saturate(150%)`,
            }">
        <div class="main-info">
            <div v-if="item.type === 'episode'">
                <router-link class="ellipsis" :to="`/show/${item.grandparentRatingKey}`" no-style>
                    <h2>{{ item.grandparentTitle }}</h2>
                </router-link>
                <router-link class="ellipsis" :to="`/episode/${item.ratingKey}`" no-style>{{ item.title }}</router-link>
                <div>
                    <episode-link :item="item"/>
                </div>
            </div>
            <router-link v-else class="ellipsis" :to="`/movie/${item.ratingKey}`" no-style>
                <h2>{{ item.title }}</h2>
            </router-link>
            <data-header class="main-header" hide-ratings :item="item"/>
            <p class="main-summary" :style="{
                        height: `calc(var(--imgHeight) - ${item.type === 'episode' ? 228 : 188}px)`,
                    }">
                {{ item.summary }}
            </p>
            <div class="data-bottom">
                <play-fab v-if="item" :item="item"/>
                <media-item-menu plain :item="item"/>
            </div>
        </div>
        <div class="main-img">
            <plex-image class="main-plex-img" v-if="mainThumb" :width="imgWidth" :height="imgHeight"
                        :src="mainThumb"/>
            <div class="main-img-overlay">
                <v-sheet class="view-progress"
                         color="primary"
                         :style="{
                             width: `${Math.round(viewProgress * 10000) / 100}%`
                         }"
                         v-if="item.viewOffset && item.duration"/>
            </div>
        </div>
    </div>
</template>

<script>
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataHeader from "@/components/DataHeader";
import EpisodeLink from "@/components/EpisodeLink";
import MediaItemMenu from "@/components/MediaItemMenu";
import PlayFab from "@/components/PlayFab";

export default {
    name: "DataCard",
    components: {PlayFab, MediaItemMenu, EpisodeLink, DataHeader, ItemRow, MediaItem, PlexImage},
    props: {
        item: {
            type: Object,
            default: null,
        },
        imgWidth: {
            type: Number,
            default: 500,
        },
    },
    computed: {
        viewProgress() {
            return this.item.viewOffset / this.item.duration;
        },
        imgHeight() {
            return this.imgWidth / 16 * 9
        },
        mainThumb() {
            return (this.item?.type === 'movie' ? this.item?.art : this.item?.thumb);
        },
    },
}
</script>

<style scoped>
.main-deck {
    width: 50%;
    margin-right: 50px;
    display: flex;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.2);
    justify-content: space-between;
}

.main-img {
    clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
    position: relative;
    height: var(--imgHeight);
    width: var(--imgWidth);
}

.main-img > * {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.view-progress {
    height: 5px;
    bottom: 0;
    top: auto;
    position: absolute;
}

.main-header {
    width: 100%;
}

.main-info {
    min-width: 300px;
    width: 40%;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    padding-left: 20px;
    padding-top: 15px;
    margin-right: -20px;
}

.ellipsis, .ellipsis > h2 {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    max-width: 100%;
}

.main-summary {
    font-size: 13px;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 3%, rgba(0, 0, 0, 1) 10%);
    width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.data-bottom {
    display: flex;
    justify-content: space-between;
    width: calc(100% - 30px);
}
</style>