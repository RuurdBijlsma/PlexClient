<template>
    <div class="show-value">
        <v-divider class="mt-2 mb-2"></v-divider>
        <div class="movie-sub-header mt-2">
            <router-link no-style :to="`/library/${metadata.librarySectionID}/?filter=year~${metadata.year}`"
                         class="ml-3">
                {{ metadata.year }}
            </router-link>
            <span class="ml-8">{{ duration }}</span>
            <v-chip :to="`/library/${metadata.librarySectionID}/?filter=contentRating~${metadata.contentRating}`"
                    class="ml-8" small>{{ metadata.contentRating }}
            </v-chip>
            <div class="movie-sub-header" v-if="metadata.rating">
                <span class="ml-8">{{ metadata.rating * 10 }}% </span>
                <div class="tomato"></div>
            </div>
            <div class="movie-sub-header" v-if="metadata.audienceRating">
                <span class="ml-3">{{ metadata.audienceRating * 10 }}% </span>
                <div class="popcorn"></div>
            </div>
        </div>
        <v-divider class="mt-2 mb-2"></v-divider>
    </div>
</template>

<script>
import Utils from "@/js/Utils";

export default {
    name: "DataHeader",
    props:{
        metadata:{
            type: Object,
            default:null,
        },
    },
    computed:{
        duration() {
            return Utils.niceTime(new Date(this.metadata.duration));
        },
    },
}
</script>

<style scoped>
.movie-sub-header {
    display: flex;
    align-items: center;
}

.show-value {
    font-size: 14px;
    font-weight: bold;
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
</style>