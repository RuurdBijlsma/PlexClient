<template>
    <div class="results-page" v-if="restored">
        <h2>Search results for “{{ query }}”</h2>
        <item-row :size="result.type === 'episode' ? 250 : 150"
                  :title="result.title"
                  show-context
                  :key="result.hubIdentifier" v-for="result in filteredResults"
                  :items="getChildren(result)"/>
    </div>
</template>

<script>
import ItemRow from "@/components/ItemRow";
import {mapActions, mapState} from "vuex";

export default {
    name: "SearchResults",
    components: {ItemRow},
    data: () => ({
        restored: false,
    }),
    async mounted() {
        await this.$store.restored;
        this.restored = true;
    },
    methods: {
        getChildren(hub) {
            return hub.Metadata ?? hub.Directory;
        },
        ...mapActions(['searchPlex']),
    },
    computed: {
        query() {
            return this.$route.query.query ?? '';
        },
        filteredResults() {
            if (this.staticResults?.query !== this.query) {
                console.log("Qujery dont match", this.query);
                this.searchPlex({query: this.query}).then(results => {
                    console.log(results);
                    this.$store.commit('saveResults', {query: this.query, results})
                });
            }
            let fr =  this.staticResults?.results?.filter(r => r.size > 0) ?? [];
            console.log("Results", fr);
            return fr;
        },
        sectionKey() {
            return this.$route.params.sectionKey ?? undefined;
        },
        ...mapState({
            staticResults: state => state.search.staticResults,
        })
    },
    watch: {},
}
</script>

<style scoped>
.results-page {
    padding: 30px 45px;
}
</style>