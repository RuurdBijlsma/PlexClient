<template>
    <v-list-item v-if="item && !deletedKeys[item.ratingKey]">
        <div v-if="!isNaN(number) || playlist !== null" class="before-square">
            <div class="item-number" v-if="!isNaN(number)">
                <span>{{ number }}</span>
            </div>
            <div class="arrange-buttons" v-if="playlist !== null">
                <v-btn @click="move(-1)" small icon
                       v-if="playlistItems.indexOf(item) !== 0">
                    <v-icon>mdi-chevron-up</v-icon>
                </v-btn>
                <v-spacer v-else></v-spacer>
                <v-btn @click="move(1)" small icon
                       v-if="playlistItems.indexOf(item) !== playlistItems.length - 1">
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </div>
        </div>
        <div class="item-img mr-4" :style="{
            '--imgWidth': imgWidth + 'px',
            '--imgHeight': imgHeight + 'px',
        }">
            <v-btn outlined icon v-if="isGenre">
                <v-icon>mdi-drama-masks</v-icon>
            </v-btn>
            <plex-image v-else :rounding="itemRounding"
                        :src="itemThumb"></plex-image>
            <router-link :to="to">
                <div class="item-img-overlay">
                    <v-btn v-if="itemType !== 'actor' && itemType !== 'genre'" color="primary" fab x-small>
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                </div>
            </router-link>
        </div>
        <v-list-item-content>
            <div v-if="itemType === 'episode'">
                <router-link no-style :to="`/show/${item.grandparentRatingKey}`">
                    <v-list-item-title :title="item.grandparentTitle">{{ item.grandparentTitle }}</v-list-item-title>
                </router-link>
                <router-link no-style :to="to">
                    <v-list-item-subtitle :title="item.title">{{ item.title }}</v-list-item-subtitle>
                </router-link>
                <v-list-item-subtitle>
                    <episode-link class="grey-subtitle" :item="item"/>
                </v-list-item-subtitle>

            </div>
            <div v-else-if="itemType === 'actor'">
                <router-link no-style :to="to">
                    <v-list-item-title :title="itemTitle">{{ itemTitle }}</v-list-item-title>
                </router-link>
                <v-list-item-subtitle :title="item.reasonTitle">{{ item.reasonTitle }}</v-list-item-subtitle>
            </div>
            <div v-else>
                <router-link no-style :to="to">
                    <v-list-item-title :title="itemTitle">{{ itemTitle }}</v-list-item-title>
                </router-link>
                <router-link no-style :to="`/library/${item.librarySectionID}/all?filter=year~${item.year}`">
                    <v-list-item-subtitle :title="item.year">{{ item.year }}</v-list-item-subtitle>
                </router-link>
            </div>
        </v-list-item-content>
        <div class="item-duration ml-3" v-if="showDuration">
            {{ duration }}
        </div>
        <div class="ml-3"></div>
        <media-item-menu :playlist="playlist" plain small :item="item"/>
    </v-list-item>
</template>

<script>
import PlexImage from "@/components/PlexImage";
import EpisodeLink from "@/components/EpisodeLink";
import Utils from "@/js/Utils";
import MediaItemMenu from "@/components/MediaItemMenu";
import {mapActions, mapGetters, mapState} from "vuex";

export default {
    name: "MediaListItem",
    components: {MediaItemMenu, EpisodeLink, PlexImage},
    props: {
        item: {
            type: Object,
            default: null,
        },
        size: {
            type: Number,
            default: 130,
        },
        measureVertical: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: null,
        },
        showContext: {
            type: Boolean,
            default: false,
        },
        number: {
            type: Number,
            default: NaN,
        },
        showDuration: {
            type: Boolean,
            default: false,
        },
        playlist: {
            type: Object,
            default: null,
        },
        playlistItems: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        move(n) {
            let currentIndex = this.playlistItems.indexOf(this.item);
            let newIndex = currentIndex + n;
            if (newIndex < 0 || newIndex >= this.playlistItems.length)
                return;
            let afterItemId = undefined;

            afterItemId = this.playlistItems[currentIndex - 1 + n]?.playlistItemID;
            this.movePlaylistItem({
                playlistKey: this.playlist.ratingKey,
                playlistItemID: this.item.playlistItemID,
                afterItemId,
            });
            this.playlistItems.splice(currentIndex, 1);
            this.playlistItems.splice(n > 0 ? newIndex : newIndex, 0, this.item);
        },
        ...mapActions(['movePlaylistItem']),
    },
    computed: {
        duration() {
            return Utils.niceTime(new Date(this.item.duration));
        },
        isGenre() {
            return this.item?.filter?.includes('genre')
        },
        itemTitle() {
            return {
                actor: this.item.tag,
            }[this.itemType] ?? this.item.title;
        },
        to() {
            return {
                actor: () => `/library/${this.item.librarySectionID}/all?filter=${this.item.filter.replace('=', '~')}`,
            }[this.itemType]?.() ?? `/${this.itemType}/${this.item.ratingKey}`;
        },
        itemRounding() {
            return {
                actor: '50%',
            }[this.itemType] ?? '0.3vw';
        },
        itemThumb() {
            let thumb;
            if (this.itemType === 'episode') {
                thumb = this.item.grandparentThumb;
            } else if (this.itemType === 'playlist') {
                thumb = this.item.composite;
            } else {
                thumb = this.item.thumb;
            }
            if (thumb === '' || thumb === undefined)
                thumb = this.notFoundImg(this.item);
            return thumb;
        },
        itemType() {
            return this.type ?? (this.item.type === 'tag' ? 'actor' : this.item.type) ?? 'show';
        },
        imgWidth() {
            return {
                actor: 45,
                playlist: 45,
            }[this.itemType] ?? 60 / 3 * 2;
        },
        imgHeight() {
            return {
                actor: 45,
                playlist: 45,
            }[this.itemType] ?? 60;
        },
        ...mapGetters(['notFoundImg']),
        ...mapState({
            deletedKeys: state => state.plex.deletedKeys,
        }),
    }
}
</script>

<style scoped>
.before-square {
    position: relative;
    width: 50px;
    margin-right: 10px;
    height: 60px;
    /*background-color: pink !important;*/
}

.before-square > * {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    text-align: center;
}

.arrange-buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    opacity: 0;
    transition: opacity 0.15s;
}

.arrange-buttons:hover {
    opacity: 1;
}

.item-number {
    opacity: 0.7;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.item-img {
    width: var(--imgWidth);
    height: var(--imgHeight);
    position: relative;
}

.item-img > * {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.item-img-overlay {
    opacity: 0;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    transition: opacity 0.15s;
}

.item-img-overlay:hover {
    opacity: 1;
}

.grey-subtitle {
    color: var(--softerForeground) !important;
}

.item-duration {
    opacity: 0.7;
    font-size: 14px;
}
</style>