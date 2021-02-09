<template>
    <div class="explore">
        <div class="on-deck" v-if="onDeck">
            <data-card class="main-card mb-10" :img-width="imgWidth" :item="mainDeck"></data-card>
            <item-row title="On deck" class="sub-deck" horizontal-movie show-context :size="300 * uiScale"
                      :to="`/library/${sectionKey}/onDeck`"
                      :items="subDeck"/>
        </div>

        <v-lazy :height="(section.type === 'episode' ? 140 : 225) * uiScale + 120"
                v-for="section in filteredHub" :key="section.hubKey"
                class="mb-7">
            <item-row :title="section.title"
                      :items="section.Metadata"
                      :size="(section.type === 'episode' ? 250 : 150) * uiScale"
                      :vertical-episode="section.type === 'mixed'"
                      show-context/>
        </v-lazy>
    </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import ItemRow from "@/components/ItemRow";
import DataCard from "@/components/DataCard";

export default {
    name: 'Home',
    components: {DataCard, ItemRow},
    async mounted() {
        await this.$store.restored;
        await this.init();
    },
    methods: {
        async init() {
            this.updateHub(this.sectionKey).then();

            console.log({
                hub: this.hub,
                onDeck: this.onDeck,
            });
        },
        ...mapActions(['updateHub']),
    },
    computed: {
        imgWidth() {
            return this.windowWidth > 1600 ? 750 : 550;
        },
        mainDeck() {
            return this.onDeck?.[0];
        },
        subDeck() {
            return this.onDeck?.slice(1);
        },
        onDeck() {
            return this.hub.find(s => s.context.includes('ondeck'))?.Metadata;
        },
        filteredHub() {
            return this.hub.filter(s => s?.Metadata?.length > 0 && !s.context.includes('ondeck'));
        },
        hub() {
            return this.$store.state.plex.content['hub' + this.sectionKey] ?? [];
        },
        sectionKey() {
            return this.$route.params.sectionKey ?? '1';
        },
        ...mapState({
            windowWidth: state => state.windowWidth,
            uiScale: state => state.uiScale,
        }),
    },
    watch: {
        key() {
            this.init();
        },
    }
}
</script>
<style scoped>
.explore {
    padding: 10px 30px;
    width: 100%;
}

.on-deck {
    align-items: center;
    display: flex;
    width: 100%;
}

@media (max-width: 1300px) {
    .on-deck {
        flex-direction: column;
    }

    .main-card {
        width: 75% !important;
        margin-right: 0 !important;
    }

    .sub-deck {
        width: 100% !important;
        margin-bottom: 30px;
    }
}

@media (max-width: 1000px) {
    .main-card {
        width: 100% !important;
    }
}

.sub-deck {
    width: calc(50% - 50px);
}
</style>