<template>
    <v-lazy>
        <div class="home" v-if="onDeck">
            <div class="on-deck">
                <data-card class="main-card" :img-width="imgWidth" :item="mainDeck"></data-card>
                <item-row title="On deck" class="sub-deck mt-10" vertical-episode show-context :size="150 * uiScale"
                          :items="subDeck"/>
            </div>
            <item-row show-context horizontal-movie :size="250 * uiScale" class="mt-10" :title="continueWatching.title"
                      :items="continueWatching.Metadata"/>
            <item-row show-context :size="150 * uiScale" class="mt-7" title="Recently Added"
                      :items="recentlyAdded"/>
        </div>
    </v-lazy>
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
        this.updateOnDeck().then();
        this.updateContinueWatching().then();
        this.updateRecentlyAdded().then();

        console.log({
            deck: this.onDeck,
            continueWatching: this.continueWatching,
            recentlyAdded: this.recentlyAdded,
        });
    },
    methods: {
        ...mapActions(['updateOnDeck', 'updateContinueWatching', 'updateRecentlyAdded']),
    },
    computed: {
        recentlyAdded() {
            return this.$store.state.plex.content.recentlyAdded ?? [];
        },
        continueWatching() {
            return this.$store.state.plex.content.continueWatching ?? [];
        },
        onDeck() {
            return this.$store.state.plex.content.onDeck ?? [];
        },
        imgWidth() {
            return this.windowWidth > 1600 ? 750 : 550;
        },
        mainDeck() {
            return this.onDeck?.[0];
        },
        subDeck() {
            return this.onDeck?.slice(1);
        },
        ...mapState({
            windowWidth: state => state.windowWidth,
            uiScale: state => state.uiScale,
        }),
    }
}
</script>
<style scoped>
.home {
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