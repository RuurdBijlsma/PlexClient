<template>
    <v-lazy>
        <div>
            <glow-column-page v-if="show"
                              :src="show.thumb"
                              :img-width="200 * uiScale"
                              :img-height="300 * uiScale">
                <router-link no-style class="show-title" :to="`/show/${show.ratingKey}`">
                    <h2>{{ show.title }}</h2>
                </router-link>
                <data-header :item="show"/>
                <data-play class="mt-3" :item="show"/>
                <data-details class="mt-4" :item="show"/>
                <h3 class="sub-header mt-13">Seasons</h3>
                <div class="seasons">
                    <media-item class="season" v-for="season in seasons"
                                :item="season"
                                :size="130 * uiScale"/>
                </div>
                <item-row class="mt-13" title="Cast" :items="show.Role"
                          :section-key="show.librarySectionID"
                          :size="130 * uiScale"
                          type="actor"/>
                <item-row v-for="item in related" class="mt-13" :title="item.title"
                          :size="130 * uiScale"
                          :items="item.Metadata"></item-row>
                <h3 class="sub-header mt-13">Similar shows</h3>
                <v-chip-group show-arrows>
                    <v-chip v-for="item in show.Similar" :key="item.id">{{ item.tag }}</v-chip>
                </v-chip-group>
            </glow-column-page>
        </div>
    </v-lazy>
</template>

<script>
import {mapActions, mapState} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import DataDetails from "@/components/DataDetails";
import DataHeader from "@/components/DataHeader";
import DataPlay from "@/components/DataPlay";
import GlowColumnPage from "@/components/GlowColumnPage";

export default {
    name: "Show",
    components: {GlowColumnPage, DataPlay, DataHeader, DataDetails, ItemRow, PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        await this.init();
        console.log(this.show);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then(e => console.log('meta', e));
            this.updateMetadataChildren(this.key).then(e => console.log('child', e));
            this.updateMetadataRelated(this.key).then(e => console.log('related', e));
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateMetadata', 'updateMetadataChildren', 'updateMetadataRelated']),
    },
    computed: {
        key() {
            return this.$route.params.key ?? '1';
        },
        show() {
            return this.$store.state.plex.content['metadata' + this.key];
        },
        seasons() {
            return this.$store.state.plex.content['metadataChildren' + this.key];
        },
        related() {
            return this.$store.state.plex.content['metadataRelated' + this.key];
        },
        ...mapState({
            uiScale: state => state.uiScale,
        }),
    },
    watch: {
        key() {
            this.init();
        },
    },
}
</script>

<style scoped>
.show-title {
    font-weight: 400;
}

.sub-header {
    font-weight: 400;
    opacity: 0.8;
    margin: 10px 0;
}

.seasons {
    margin-left: -15px;
}

.season {
    margin: 8px 15px;
}
</style>