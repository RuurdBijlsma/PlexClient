<template>
    <div class="main-deck mt-3" v-if="metadata" :style="{
                '--imgHeight': Math.round(imgHeight) + 'px',
                backdropFilter: `blur(40px) brightness(${$vuetify.theme.dark ? '150' : '110'}%) saturate(150%)`,
            }">
        <div class="main-info">
            <div v-if="metadata.type === 'episode'">
                <router-link class="ellipsis" :to="`/show/${metadata.grandparentRatingKey}`" no-style>
                    <h2>{{ metadata.grandparentTitle }}</h2>
                </router-link>
                <router-link class="ellipsis" to="/" no-style>{{ metadata.title }}</router-link>
                <div>
                    <episode-link :metadata="metadata"/>
                </div>
            </div>
            <router-link v-else class="ellipsis" :to="`/movie/${metadata.ratingKey}`" no-style>
                <h2>{{ metadata.title }}</h2>
            </router-link>
            <data-header class="main-header" hide-ratings :metadata="metadata"/>
            <p class="main-summary" :style="{
                        height: `calc(var(--imgHeight) - ${metadata.type === 'episode' ? 228 : 188}px)`,
                    }">
                {{ metadata.summary }}
            </p>
            <v-btn elevation="0" fab color="primary" small>
                <v-icon>mdi-play</v-icon>
            </v-btn>
        </div>
        <plex-image class="main-img" v-if="mainThumb" :width="imgWidth" :height="imgHeight"
                    :src="mainThumb"></plex-image>
    </div>
</template>

<script>
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataHeader from "@/components/DataHeader";
import EpisodeLink from "@/components/EpisodeLink";

export default {
    name: "DataCard",
    components: {EpisodeLink, DataHeader, ItemRow, MediaItem, PlexImage},
    props: {
        metadata: {
            type: Object,
            default: null,
        },
        imgWidth: {
            type: Number,
            default: 500,
        },
    },
    computed: {
        imgHeight() {
            return this.imgWidth / 16 * 9
        },
        mainThumb() {
            return (this.metadata?.type === 'movie' ? this.metadata?.art : this.metadata?.thumb);
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
</style>