<template>
    <div v-if="item && !deletedKeys[item.ratingKey]" class="media-item" :class="{
        'active': isActive,
    }" :style="{
        '--width': width + 'px',
        '--height': height + 'px',
        '--imgHeight': imgHeight + 'px',
    }">
        <div class="image-container">
            <v-btn outlined icon v-if="isGenre" :width="imgWidth" :height="imgHeight">
                <v-icon x-large>mdi-drama-masks</v-icon>
            </v-btn>
            <plex-image class="img"
                        :rounding="itemRounding"
                        v-else
                        :width="imgWidth" :height="imgHeight"
                        :src="itemThumb"/>
            <div class="viewed-count">
                <v-btn x-small fab color="primary"
                       v-if="!item.viewCount && !isActive && (itemType === 'movie' || itemType === 'episode')"
                       class="playing-chip">
                    <v-icon>
                        mdi-play-circle-outline
                    </v-icon>
                </v-btn>
                <v-chip label color="primary" small
                        v-else-if="!isActive && unviewedLeafCount !== 0 && (itemType === 'season' || itemType === 'show')"
                        class="playing-chip">
                    {{ unviewedLeafCount }}
                </v-chip>
            </div>
            <router-link class="item-buttons" :to="to" :style="{
                borderRadius: itemRounding,
            }">
                <v-chip label small v-if="isActive" class="playing-chip">
                    <v-icon class="mr-1 ml-neg" small>mdi-play</v-icon>
                    Playing
                </v-chip>
                <play-fab v-if="canPlay" :item="item"/>
                <v-spacer v-else/>
                <media-item-menu dark :item="item"/>
            </router-link>
            <div class="img-overlay">
                <v-sheet class="view-progress"
                         color="primary"
                         :style="{
                             height: itemRounding,
                             borderBottomLeftRadius: itemRounding,
                             borderBottomRightRadius: viewProgress > 0.99 ? itemRounding : '0',
                             width: `${Math.round(viewProgress * 10000) / 100}%`
                         }"
                         v-if="item.viewOffset && item.duration"/>
            </div>
        </div>
        <div class="item-bottom" v-if="!hideTitle" :style="{
            textAlign: itemType === 'actor' || itemType === 'tag' ? 'center' : 'left'
        }">
            <v-icon v-if="itemType === 'folder'" class="mr-2">mdi-folder</v-icon>
            <div v-if="showContext && itemType === 'episode'">
                <router-link class="item-title" :to="`/show/${item.grandparentRatingKey}`"
                             :title="item.grandparentTitle"> {{ item.grandparentTitle }}
                </router-link>
                <router-link class="item-grey-text" :to="to" no-style :title="item.title">
                    {{ item.title }}
                </router-link>
                <div class="item-grey-text">
                    <episode-link :item="item"/>
                </div>
            </div>
            <div v-else-if="showContext && itemType === 'season'">
                <router-link class="item-title" :to="`/show/${item.parentRatingKey}`"
                             :title="item.parentTitle"> {{ item.parentTitle }}
                </router-link>
                <router-link class="item-grey-text" :to="to" no-style :title="item.title">
                    {{ item.title }}
                </router-link>
            </div>
            <div v-else>
                <router-link class="item-title" :to="to" :title="itemTitle">{{ itemTitle }}</router-link>
                <div
                    class="item-grey-text"
                    v-for="subtitle of itemSubtitles"
                    :title="subtitle">
                    {{ subtitle }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import PlexImage from "@/components/PlexImage";
import ta from 'time-ago'
import Utils from "@/js/Utils";
import {mapActions, mapGetters, mapState} from "vuex";
import EpisodeLink from "@/components/EpisodeLink";
import MediaItemMenu from "@/components/MediaItemMenu";
import PlayFab from "@/components/PlayFab";

export default {
    name: "MediaItem",
    components: {PlayFab, MediaItemMenu, EpisodeLink, PlexImage},
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
        hideTitle: {
            type: Boolean,
            default: false,
        },
        sortProp: {
            type: String,
            default: null,
        },
        showContext: {
            type: Boolean,
            default: false,
        },
        verticalEpisode: {
            type: Boolean,
            default: false,
        },
        horizontalMovie: {
            type: Boolean,
            default: false,
        },
        sectionKey: {
            type: Number,
            default: NaN,
        },
    },
    computed: {
        unviewedLeafCount() {
            return this.item.leafCount - this.item.viewedLeafCount;
        },
        canPlay() {
            return this.itemCanPlay(this.item);
        },
        isActive() {
            return this.itemIsActive(this.item);
        },
        viewProgress() {
            return this.item.viewOffset / this.item.duration;
        },
        isGenre() {
            return this.item?.filter?.includes('genre')
        },
        itemTitle() {
            return {
                actor: this.item.tag,
                tag: this.item.tag,
            }[this.itemType] ?? this.item.title;
        },
        itemSubtitles() {
            let subtitles = []

            subtitles.push(...[{
                tag: () => this.item.reasonTitle,
                show: () => `${this.item.childCount} season${this.item.childCount === 1 ? '' : 's'}`,
                movie: () => this.item.year,
                season: () => `${this.item.leafCount} episode${this.item.leafCount === 1 ? '' : 's'}`,
                actor: () => this.item.role?.replaceAll('|', ', '),
                episode: () => `Episode ${this.item.index}`,
            }[this.itemType]?.()] ?? []);

            if (this.sortProp !== null && this.sortProp !== 'titleSort') {
                let sortValue = this.item[this.sortProp];
                subtitles = [{
                    rating: () => `⭐ ${sortValue * 10}%`,
                    audienceRating: () => `🌟 ${sortValue * 10}%`,
                    originallyAvailableAt: () => Utils.niceDate(new Date(sortValue)),
                    lastViewedAt: () => ta.ago(new Date(sortValue * 1000)),
                    duration: () => Utils.niceTime(new Date(sortValue)),
                    unviewedLeafCount: () => (this.item.leafCount - this.item.viewedLeafCount) + ' unwatched episodes',
                    addedAt: () => ta.ago(new Date(sortValue * 1000)),
                }[this.sortProp]?.() ?? sortValue]
            }

            return [...subtitles];
        },
        itemSection() {
            return (isNaN(this.sectionKey) ? this.item.librarySectionID : this.sectionKey) ?? 1;
        },
        to() {
            return {
                actor: () => `/library/${this.itemSection}/all?filter=actor~${this.item.id}`,
                tag: () => `/library/${this.itemSection}/all?filter=${this.item.filter.replace('=', '~')}`,
            }[this.itemType]?.() ?? `/${this.itemType}/${this.item.ratingKey}`;
        },
        itemRounding() {
            return {
                actor: '50%',
                tag: '50%',
            }[this.itemType] ?? '5px';
        },
        itemThumb() {
            let thumb;
            if (this.verticalEpisode && this.itemType === 'episode') {
                thumb = this.item.grandparentThumb;
            } else if (this.horizontalMovie && this.itemType === 'movie') {
                thumb = this.item.art;
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
            return this.type ?? this.item.type ?? 'show';
        },
        imgWidth() {
            return this.measureVertical ? this.size * this.aspectRatio : this.size;
        },
        imgHeight() {
            return this.measureVertical ? this.size : this.size / this.aspectRatio;
        },
        width() {
            return this.imgWidth;
        },
        height() {
            return this.imgHeight + (this.showContext ? 72 : 51);
        },
        aspectRatio() {
            if (this.verticalEpisode && this.itemType === 'episode')
                return 10 / 15;
            if (this.horizontalMovie && this.itemType === 'movie')
                return 16 / 9;
            return {
                show: 10 / 15,
                movie: 10 / 15,
                season: 10 / 15,
                playlist: 1,
                actor: 1,
                tag: 1,
            }[this.itemType] ?? 16 / 9;
        },
        ...mapGetters(['notFoundImg', 'itemCanPlay', 'itemIsActive']),
        ...mapState({
            srcLoading: state => state.media.srcLoading,
            playing: state => state.media.playing,
            deletedKeys: state => state.plex.deletedKeys,
            context: state => state.media.context,
        }),
    }
}
</script>

<style scoped>
.media-item {
    height: var(--height);
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

.img-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.view-progress {
    bottom: 0;
    left: 0;
    position: absolute;
}

.active .item-buttons {
    opacity: 1;
}

.viewed-count {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: calc(var(--width) / 20);
}

.item-buttons {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;

    backdrop-filter: saturate(120%) contrast(110%);
    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 50%);
    opacity: 0;

    padding: calc(var(--width) / 20);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    transition: opacity 0.2s;
    cursor: pointer;
    text-decoration: none;
}

.item-buttons:hover {
    opacity: 1;
}

.playing-chip {
    font-weight: bolder;
    position: absolute;
    top: calc(var(--width) / 20);
    left: calc(var(--width) / 20);
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
    font-weight: 500;
    display: block;

    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.item-title:hover {
    text-decoration: underline;
}

.item-grey-text {
    display: block;
    opacity: 0.7;
    font-weight: 400;

    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.ml-neg {
    margin-left: -5px;
}

</style>
