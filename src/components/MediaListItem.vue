<template>
    <v-list-item>
        <div class="item-img mr-4" :style="{
            '--imgWidth': imgWidth + 'px',
            '--imgHeight': imgHeight + 'px',
        }">
            <v-btn outlined icon v-if="isGenre"><v-icon>mdi-drama-masks</v-icon></v-btn>
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
                <v-list-item-subtitle class="grey-subtitle">
                    <router-link :to="`/season/${item.parentRatingKey}`" no-style :title="item.parentTitle">
                        S{{ item.parentIndex }}
                    </router-link>
                    <span> • </span>
                    <router-link :to="to" no-style :title="item.title">E{{ item.index }}</router-link>
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
    </v-list-item>
</template>

<script>
import PlexImage from "@/components/PlexImage";

export default {
    name: "MediaListItem",
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
    },
    computed: {
        isGenre(){
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
            if (this.itemType === 'episode') {
                return this.item.grandparentThumb;
            } else {
                return this.item.thumb;
            }
        },
        itemType() {
            return this.type ?? (this.item.type === 'tag' ? 'actor' : this.item.type) ?? 'show';
        },
        imgWidth() {
            return {
                actor: 45,
            }[this.itemType] ?? 60 / 3 * 2;
        },
        imgHeight() {
            return {
                actor: 45,
            }[this.itemType] ?? 60;
        },
    }
}
</script>

<style scoped>
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

.grey-subtitle > * {
    color: var(--softerForeground) !important;
}
</style>