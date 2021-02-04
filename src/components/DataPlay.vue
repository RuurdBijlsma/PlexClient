<template>
    <div class="episode-buttons">
        <v-btn color="primary" small rounded elevation="0">
            <v-icon class="mr-2">mdi-play</v-icon>
            Play
        </v-btn>
        <div>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn class="ml-5"
                           plain
                           icon v-bind="attrs"
                           v-on="on">
                        <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
                    </v-btn>
                </template>
                <span>Mark as watched</span>
            </v-tooltip>
            <v-btn class="ml-5 mr-2" icon plain>
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
export default {
    name: "DataPlay",
    props: {
        metadata: {
            type: Object,
            default: null,
        },
    },
}
</script>

<style scoped>
.episode-buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>