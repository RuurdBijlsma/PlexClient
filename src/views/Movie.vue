<template>
    <div v-if="movie" class="show">
        <div class="left-column">
            <plex-image :src="movie.thumb" glow
                        :width="250" :height="375"
                        rounding="10px" :item="movie"
                        class="ml-6"
                        hide-title></plex-image>
        </div>
        <div class="right-column">
            <router-link no-style :to="`/episode/${movie.ratingKey}`" class="show-title">
                <h2>{{ movie.title }}</h2>
            </router-link>
            <v-divider class="mt-2 mb-2"></v-divider>
            <div class="show-value movie-sub-header mt-2">
                <router-link no-style :to="`/library/${movie.librarySectionID}/?filter=year~${movie.year}`"
                             class="ml-3">
                    {{ movie.year }}
                </router-link>
                <span class="ml-8">{{ duration }}</span>
                <v-chip :to="`/library/${movie.librarySectionID}/?filter=contentRating~${movie.contentRating}`"
                        class="ml-8" small>{{ movie.contentRating }}
                </v-chip>
                <span class="ml-8">{{ movie.rating * 10 }}% </span>
                <div class="tomato"></div>
                <span class="ml-3">{{ movie.audienceRating * 10 }}% </span>
                <div class="popcorn"></div>
            </div>
            <v-divider class="mt-2 mb-2"></v-divider>
            <div class="episode-buttons mt-3">
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
            <p class="show-summary mt-3">{{ movie.summary }}</p>
            <div class="mt-3">
                <p class="show-detail">
                    <span v-for="(genre, i) in movie.Genre" :key="genre.id">
                        <router-link no-style
                                     :to="`/library/${movie.librarySectionID}/?filter=genre~${genre.id}`"
                                     class="show-value">{{ genre.tag }}</router-link><span
                        v-if="i < movie.Genre.length - 1"> • </span>
                    </span>
                </p>
                <p class="show-detail mt-3">Directed by:
                    <span v-for="(director, i) in movie.Director" :key="director.id">
                        <router-link no-style
                                     :to="`/library/${movie.librarySectionID}/?filter=director~${director.id}`"
                                     class="show-value">{{ director.tag }}</router-link><span
                        v-if="i < movie.Director.length - 1">, </span>
                    </span>
                </p>
                <p class="show-detail">Written by:
                    <span v-for="(writer, i) in movie.Writer" :key="writer.id">
                        <router-link no-style :to="`/library/${movie.librarySectionID}/?filter=writer~${writer.id}`"
                                     class="show-value">{{ writer.tag }}</router-link><span
                        v-if="i < movie.Writer.length - 1">, </span>
                    </span>
                </p>
                <p class="show-detail">Created in:
                    <span v-for="(country, i) in movie.Country" :key="country.id">
                        <router-link no-style :to="`/library/${movie.librarySectionID}/?filter=country~${country.id}`"
                                     class="show-value">{{ country.tag }}</router-link><span
                        v-if="i < movie.Country.length - 1">, </span>
                    </span>
                </p>
                <p class="show-detail">Studio:
                    <router-link class="show-value" no-style
                                 :to="`/library/${movie.librarySectionID}/?filter=studio~${movie.studio}`">
                        {{ movie.studio }}
                    </router-link>
                </p>
            </div>
            <item-row :section-key="movie.librarySectionID" class="mt-13" title="Cast" :items="movie.Role"
                      type="actor"/>
            <item-row :section-key="movie.librarySectionID" v-for="item in related" class="mt-13" :title="item.title"
                      :items="item.Metadata"></item-row>
            <h3 class="sub-header mt-13">Similar movies</h3>
            <v-chip-group show-arrows>
                <v-chip v-for="item in movie.Similar" :key="item.id">{{ item.tag }}</v-chip>
            </v-chip-group>
        </div>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";
import ItemRow from "@/components/ItemRow";
import Utils from "@/js/Utils";

export default {
    name: "Show",
    components: {ItemRow, PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        await this.$store.restored;
        console.log(5555, this.key);
        await this.init();
        console.log(this.movie);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then(e => console.log('meta', e));
            this.updateMetadataRelated(this.key).then(e => console.log('related', e));
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateMetadata', 'updateMetadataChildren', 'updateMetadataRelated']),
    },
    computed: {
        duration() {
            return Utils.niceTime(new Date(this.movie.duration));
        },
        availableAt() {
            return Utils.niceDate(new Date(this.movie.originallyAvailableAt));
        },
        key() {
            return this.$route.params.key ?? '1';
        },
        movie() {
            return this.$store.state.plex.content['metadata' + this.key];
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
p {
    margin-bottom: 3px;
}

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
    width: calc(100% - 274px - 50px);
    margin-left: calc(274px + 50px);
}

.show-title {
    font-weight: 400;
}

.show-summary {
    font-size: 14px;
    width: 100%;
    max-width: 600px;
}

.show-detail {
    font-size: 14px;
}

.show-value {
    font-size: 14px;
    font-weight: bold;
}

.show-parent {
    font-weight: bold;
}

.show-parent > p {
    margin-top: 0px;
    margin-bottom: 0px;
}

.episode-buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.movie-sub-header {
    display: flex;
    align-items: center;
}

.tomato {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NjAiIGhlaWdodD0iNTYwIj48ZyBmaWxsPSJub25lIj48cGF0aCBmaWxsPSIjRkEzMjBBIiBkPSJNNDc4LjI5IDI5Ni45NzZjLTMuOTktNjMuOTY2LTM2LjUyLTExMS44MjMtODUuNDY4LTEzOC41NzkuMjc4IDEuNTYtMS4xMDkgMy41MDgtMi42ODggMi44MTgtMzIuMDE2LTE0LjAwNi04Ni4zMjggMzEuMzItMTI0LjI4MiA3LjU4NC4yODUgOC41MTktMS4zNzggNTAuMDcyLTU5LjkxNCA1Mi40ODMtMS4zODIuMDU2LTIuMTQyLTEuMzU1LTEuMjY4LTIuMzU0IDcuODI4LTguOTI5IDE1LjczMi0zMS41MzUgNC4zNjctNDMuNTg2LTI0LjMzOCAyMS44MS0zOC40NzIgMzAuMDE3LTg1LjEzOCAxOS4xODYtMjkuODc4IDMxLjI0MS00Ni44MDkgNzQtNDMuNDg1IDEyNy4yNjUgNi43OCAxMDguNzM1IDEwOC42MyAxNzAuODkgMjExLjE5MyAxNjQuNDkgMTAyLjU1Ni02LjM5NSAxOTMuNDY2LTgwLjU3MiAxODYuNjgzLTE4OS4zMDciLz48cGF0aCBmaWxsPSIjMDA5MTJEIiBkPSJNMjkxLjM3NSAxMzIuMjkzYzIxLjA3NS01LjAyMyA4MS42OTMtLjQ5IDEwMS4xMTQgMjUuMjc0IDEuMTY2IDEuNTQ1LS40NzUgNC40NjgtMi4zNTUgMy42NDgtMzIuMDE2LTE0LjAwNi04Ni4zMjggMzEuMzItMTI0LjI4MiA3LjU4NC4yODUgOC41MTktMS4zNzggNTAuMDcyLTU5LjkxNCA1Mi40ODMtMS4zODIuMDU2LTIuMTQyLTEuMzU1LTEuMjY4LTIuMzU0IDcuODI4LTguOTI5IDE1LjczLTMxLjUzNSA0LjM2Ny00My41ODYtMjYuNTEyIDIzLjc1OC00MC44ODQgMzEuMzkyLTk4LjQyNiAxNS44MzgtMS44ODMtLjUwOC0xLjI0MS0zLjUzNS43NjItNC4yOTggMTAuODc2LTQuMTU3IDM1LjUxNS0yMi4zNjEgNTguODI0LTMwLjM4NSA0LjQzOC0xLjUyNiA4Ljg2Mi0yLjcxIDEzLjE4LTMuNC0yNS42NjUtMi4yOTMtMzcuMjM1LTUuODYyLTUzLjU1OS0zLjQtMS43ODkuMjctMy4wMDQtMS44MTMtMS44OTUtMy4yNDEgMjEuOTk1LTI4LjMzMiA2Mi41MTMtMzYuODg4IDg3LjUxMi0yMS44MzctMTUuNDEtMTkuMDk0LTI3LjQ4LTM0LjMyMS0yNy40OC0zNC4zMjFsMjguNjAxLTE2LjI0NnMxMS44MTcgMjYuNCAyMC40MTQgNDUuNjE0YzIxLjI3NS0zMS40MzUgNjAuODYtMzQuMzM2IDc3LjU4NS0xMi4wMzMuOTkyIDEuMzI2LS4wNDUgMy4yMS0xLjcwMiAzLjE3MS0xMy42MTItLjMzMS0yMS4xMDcgMTIuMDUtMjEuNjc1IDIxLjQ2NmwuMTk3LjAyMyIvPjwvZz48L3N2Zz4=");
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: contain;
    display: inline-block;
}

.popcorn {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NjAiIGhlaWdodD0iNTYwIj48ZyBmaWxsPSJub25lIj48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMzcwLjU3IDQ3NC4yMTRsMjMuNDY2LTIzNy45NTZjMTQuOTMtNC43OTYgMjkuNDk4LTExLjE1IDQwLjIzLTIwLjI2Mkw0MDQuMTYgNDQ2LjI3OGMtNi43NDggMTAuMjQ4LTE5Ljg2MyAyMC44Ni0zMy41OSAyNy45MzZ6bS03OC4xOTcgMjEuNjMxbDIuOTQ3LTI0NC41MjhjMjAuODk0LS41OTkgNDcuOTMzLTMuNDMgNzAuOTctOC4zNDZsLTE5LjA3IDI0MS4xN2MtMjIuNzI0IDcuNTE4LTM1LjkzNCA5Ljg0OC01NC44NDcgMTEuNzA0em0tOTkuNjk0LTI1Mi44NzRjMjMuMDM4IDQuOTE2IDUwLjA3NyA3Ljc0NyA3MC45NzEgOC4zNDZsMi45NDggMjQ0LjUyOGMtMTguOTE0LTEuODU2LTMyLjEyMy00LjE4Ni01NC44NDctMTEuNzA1bC0xOS4wNzItMjQxLjE3em0tNjcuOTc0LTI2Ljk3NWMxMC43MzIgOS4xMTIgMjUuMyAxNS40NjYgNDAuMjMgMjAuMjYybDIzLjQ2NCAyMzcuOTU2Yy0xMy43MjYtNy4wNzUtMjYuODQtMTcuNjg4LTMzLjU5LTI3LjkzNmwtMzAuMTA0LTIzMC4yODJ6Ii8+PHBhdGggZmlsbD0iZ29sZCIgZD0iTTExOC45MDUgMTU3LjQ0NWMxLjM1NyAyOC44MjcgNzIuNzcxIDUxLjY3NyAxNjAuNTc4IDUxLjE3NiA3Ni42ODctLjQzOCAxNDAuNjU5LTE4LjU0NiAxNTYuMzI5LTQyLjMzNmEyMi45NzYgMjIuOTc2IDAgMDAtMTQuMDU4LTcuNDI2Yy4wNi0uNy4wOTgtMS40MDYuMDk1LTIuMTIyLS4wNjUtMTEuNC04LjQyOS0yMC43ODgtMTkuMzI3LTIyLjU0LjI4Ny0xLjQ3NC40MzgtMi45OTkuNDMtNC41NTktLjA3Mi0xMi42OTYtMTAuNDI2LTIyLjkyOC0yMy4xMjQtMjIuODU2LS4yODcuMDAxLS41NjguMDM2LS44NTMuMDQ5YTIyLjkxMSAyMi45MTEgMCAwMDEuMjU0LTcuNTZjLS4wNzQtMTIuNjk3LTEwLjQyNS0yMi45My0yMy4xMjMtMjIuODU4YTIyLjkxNCAyMi45MTQgMCAwMC04LjI0NyAxLjZjLTMuNjMyLTYuODM1LTEwLjYwNi0xMS42LTE4LjczNy0xMi4xNDktMS40MTYtMTEuNC0xMS4xNTctMjAuMTk1LTIyLjkzLTIwLjEyOS03LjQxLjA0Mi0xMy45NjMgMy42LTE4LjEzNiA5LjA2NS00LjIzMy00LjYwNS0xMC4zLTcuNDk0LTE3LjA0Ny03LjQ1Ni0xMi42OTguMDcyLTIyLjkzMiAxMC40MjQtMjIuODYgMjMuMTE4YTIyLjk4MyAyMi45ODMgMCAwMDEuMTE1IDYuOTQ2IDIyLjkxOCAyMi45MTggMCAwMC0xMy4wNyA3LjQ1OWMtMi42NDQtOS44NDctMTEuNjM3LTE3LjA4NC0yMi4zMTQtMTcuMDI0LTkuOTc1LjA1Ny0xOC40MDYgNi40Ny0yMS41MzcgMTUuMzY2LTguNDc0IDMuNDI2LTE0LjQzOSAxMS43MzgtMTQuMzgzIDIxLjQzMy4wMTIgMi4xNTQuMzQyIDQuMjI3LjkwNyA2LjIwMmEyMi44NzYgMjIuODc2IDAgMDAtOS4zMjgtMS45MzJjLTEwLjAxMi4wNTgtMTguNDcgNi41MTYtMjEuNTc0IDE1LjQ2NWEyMi44MyAyMi44MyAwIDAwLTkuNzg4LTIuMTQ5Yy0xMi42OTguMDcyLTIyLjkzNCAxMC40MjItMjIuODYgMjMuMTE4YTIyLjgzMyAyMi44MzMgMCAwMDMuMTU5IDExLjQ2M2MtLjIwMi4yMDMtLjM3OS40MjYtLjU3MS42MzYiLz48cGF0aCBmaWxsPSIjRkEzMjBBIiBkPSJNNDA0LjE2MSA0NDYuMjc4Yy02Ljc0OSAxMC4yNDgtMTkuODY0IDIwLjg2LTMzLjU5IDI3LjkzNmwyMy40NjUtMjM3Ljk1NmMxNC45My00Ljc5NiAyOS40OTgtMTEuMTUgNDAuMjMtMjAuMjYyTDQwNC4xNiA0NDYuMjc4ek0zNDcuMjIgNDg0LjE0Yy0yMi43MjMgNy41MTktMzUuOTM0IDkuODUtNTQuODQ3IDExLjcwNWwyLjk0Ny0yNDQuNTI4YzIwLjg5NC0uNTk5IDQ3LjkzMy0zLjQzIDcwLjk3My04LjM0NkwzNDcuMjIgNDg0LjE0em0tMTM1LjQ3IDBsLTE5LjA3LTI0MS4xN2MyMy4wMzcgNC45MTcgNTAuMDc2IDcuNzQ4IDcwLjk3IDguMzQ3bDIuOTQ4IDI0NC41MjhjLTE4LjkxNC0xLjg1Ni0zMi4xMjMtNC4xODYtNTQuODQ3LTExLjcwNXptLTU2Ljk0LTM3Ljg2MmwtMzAuMTA1LTIzMC4yODJjMTAuNzMyIDkuMTEyIDI1LjMgMTUuNDY2IDQwLjIzIDIwLjI2MmwyMy40NjQgMjM3Ljk1NmMtMTMuNzI2LTcuMDc1LTI2Ljg0LTE3LjY4OC0zMy41ODgtMjcuOTM2em0yNDcuNjY4LTMyMS4xNDNjLjI5OCAxLjQ1My40NjUgMi45NTUuNDczIDQuNDk4YTIzLjAxOCAyMy4wMTggMCAwMS0uNDMgNC41NmMxMC45IDEuNzQ5IDE5LjI2MyAxMS4xMzcgMTkuMzI4IDIyLjU0YTIzLjU5IDIzLjU5IDAgMDEtLjA5NSAyLjEyIDIyLjk3NiAyMi45NzYgMCAwMTE0LjA1OCA3LjQyNWMtMTUuNjY5IDIzLjc5Mi03OS42NDIgNDEuOS0xNTYuMzI3IDQyLjM0LTg3LjgwNy41MDItMTU5LjIyMS0yMi4zNDYtMTYwLjU4LTUxLjE3NS4xOTItLjIwOC4zNy0uNDMzLjU3LS42MzQtMS4zNTUtMi4zMTEtMi4yOS00Ljg4Ny0yLjc3My03LjYyLTguNDA4IDcuOTc5LTEzLjQ5NSAxNC40MTItMTIuNiAyMy43OC4wODUgMS4yNTEgMzcuMTk2IDI2Ni45MTEgMzcuMTk2IDI2Ni45MTEgNC4yODIgNDIuMDc1IDY1LjM5MSA3NS43MDMgMTM4LjE4NyA3Ni4xMiA3Mi43OTYtLjQxNyAxMzMuOTA3LTM0LjA0NSAxMzguMTg3LTc2LjEyIDAgMCAzNy4xMS0yNjUuNjYgMzcuMTk3LTI2Ni45MTIgMS43NzctMTguNzM2LTIwLjE1LTM1Ljc0NS01Mi4zOS00Ny44MzN6Ii8+PC9nPjwvc3ZnPg==");
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: contain;
    display: inline-block;
}

.sub-header {
    font-weight: 400;
    opacity: 0.8;
    margin: 10px 0;
}
</style>