<template>
    <v-lazy>
        <div v-if="show" class="show">
            <div class="left-column">
                <plex-image
                    glow
                    class="ml-6"
                    rounding="10px"
                    :src="show.thumb"
                    :width="200"
                    :height="300"/>
            </div>
            <div class="right-column">
                <router-link no-style class="show-title" :to="`/show/${show.ratingKey}`">
                    <h2>{{ show.title }}</h2>
                </router-link>
                <router-link no-style class="show-value"
                             :to="`/library/${show.librarySectionID}/?filter=year~${show.year}`">
                    <p>{{ show.year }}</p>
                </router-link>
                <p class="show-summary">{{ show.summary }}</p>
                <p class="show-detail">Studio:
                    <router-link no-style class="show-value"
                                 :to="`/library/${show.librarySectionID}/?filter=studio~${show.studio}`">
                        {{ show.studio }}
                    </router-link>
                <p class="show-detail">Genres:
                    <span v-for="(genre, i) in show.Genre" :key="genre.id">
                    <router-link no-style class="show-value"
                                 :to="`/library/${show.librarySectionID}/?filter=genre~${genre.id}`">
                        {{ genre.tag }}
                    </router-link>
                    <span v-if="i < show.Genre.length - 1">, </span>
                </span>
                </p>
                <h3 class="sub-header mt-13">Seasons</h3>
                <div class="seasons">
                    <media-item class="season" v-for="season in seasons" :item="season"/>
                </div>
                <item-row :section-key="show.librarySectionID" class="mt-13" title="Cast" :items="show.Role"
                          type="actor"/>
                <item-row :section-key="show.librarySectionID" v-for="item in related" class="mt-13" :title="item.title"
                          :items="item.Metadata"></item-row>
                <!--<item-row class="mt-13" title="Related shows" :items="show.Similar"></item-row>-->
                <h3 class="sub-header mt-13">Similar shows</h3>
                <v-chip-group show-arrows>
                    <v-chip v-for="item in show.Similar" :key="item.id">{{ item.tag }}</v-chip>
                </v-chip-group>
            </div>
        </div>

    </v-lazy>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";

export default {
    name: "Show",
    components: {ItemRow, PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        console.log(5555, this.key);
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
    },
    watch: {
        key() {
            this.init();
        },
    },
}
</script>

<style scoped>
.show {
    max-width: 1300px;
    width: calc(100% - 20px);
    padding: 30px 10px;
    margin: 0 auto;
    display: flex;
}

.left-column {
    position: fixed;
}

.right-column {
    width: calc(100% - 224px - 50px);
    margin-left: calc(224px + 50px);
}

.show-title {
    font-weight: 400;
}

.sub-header {
    font-weight: 400;
    opacity: 0.8;
    margin: 10px 0;
}

.show-summary {
    font-size: 14px;
    width: 100%;
    max-width: 600px;
}

.show-detail {
    margin: 3px 0;
    opacity: 0.7;
}

.show-value {
    font-weight: bold;
}

.seasons {
    margin-left: -15px;
}

.season {
    margin: 8px 15px;
}

</style>