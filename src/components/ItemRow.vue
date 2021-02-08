<template>
    <div class="item-row">
        <div class="control-row">
            <router-link no-style v-if="to" :to="to">
                <h3 class="control-title">{{ title }}</h3>
            </router-link>
            <h3 class="control-title" v-else>{{ title }}</h3>
            <div class="right-control" v-if="itemGroups.length > itemsPerPage">
                <span class="scroll-progress mr-2">
                    {{ (inView * rows) + 1 }} / {{ items.length }}
                </span>
                <v-btn :disabled="!contentLeft" icon class="mr-2" plain @click="scrollRow(-1)"
                       @dblclick="scrollRow(-5)">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn :disabled="!contentRight" icon plain @click="scrollRow(1)" @dblclick="scrollRow(5)">
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
        </div>
        <div class="item-container" ref="container" :style="{
            maskImage: `linear-gradient(to right, rgba(0, 0, 0, ${contentLeft ? 0 : 1}) 0%, rgba(0, 0, 0, 1) 5%),
linear-gradient(to left, rgba(0, 0, 0, ${contentRight ? 0 : 1}) 0%, rgba(0, 0, 0, 1) 5%)`,
        }">
            <div class="column" v-for="itemGroup in itemGroups" ref="columns">
                <media-item v-for="item in itemGroup"
                            :key="item.ratingKey"
                            :measure-vertical="measureVertical"
                            :size="size"
                            :type="type"
                            :section-key="sectionKey"
                            :sort-prop="sortProp"
                            :vertical-episode="verticalEpisode"
                            :horizontal-movie="horizontalMovie"
                            class="single-item"
                            :show-context="showContext"
                            :item="item"/>
            </div>
        </div>
    </div>
</template>

<script>
import MediaItem from "@/components/MediaItem";

export default {
    name: "ItemRow",
    components: {MediaItem},
    props: {
        title: {
            type: String,
            default: '',
        },
        items: {
            type: Array,
            default: () => [],
        },
        rows: {
            type: Number,
            default: 1,
        },
        size: {
            type: Number,
            default: 130,
        },
        type: {
            type: String,
            default: null,
        },
        to: {
            type: String,
            default: '',
        },
        measureVertical: {
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
    data: () => ({
        scrollWidth: 0,
        scrollLeft: 0,
        offsetWidth: 0,
        resizeInterval: -1,
    }),
    beforeDestroy() {
        this.$refs.container.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('resize', this.resizeListener);
        clearInterval(this.resizeInterval);
    },
    mounted() {
        window.addEventListener('resize', this.resizeListener, false);
        this.$refs.container.addEventListener('scroll', this.scrollListener, false);
        this.resizeInterval = setInterval(() => this.resizeListener(), 1000 / 3);
        this.resizeListener();
        this.scrollListener();
    },
    methods: {
        resizeListener() {
            this.scrollWidth = this.$refs.container?.scrollWidth ?? 0;
            this.offsetWidth = this.$refs.container?.offsetWidth ?? 0;
        },
        scrollListener() {
            this.scrollLeft = this.$refs.container?.scrollLeft ?? 0;
        },
        scrollRow(x) {
            this.$refs.container.scrollTo({
                top: 0,
                left: this.scrollLeft + (this.offsetWidth - this.size) * x,
                behavior: 'smooth'
            });
        },
    },
    computed: {
        inView() {
            return Math.floor((this.scrollLeft + this.offsetWidth) / (this.size + 30));
        },
        minIndex() {
            return Math.floor(this.itemsPerPage) - 1;
        },
        itemsPerPage() {
            return this.offsetWidth / (this.size + 30);
        },
        contentLeft() {
            return this.scrollLeft > 0;
        },
        contentRight() {
            return this.scrollWidth - (this.scrollLeft + this.offsetWidth);
        },
        itemGroups() {
            let groups = [];
            for (let i = 0; i < this.items.length; i += this.rows)
                groups.push(this.items.slice(i, i + this.rows));

            return groups;
        }
    }
}
</script>

<style scoped>
.item-row {
    max-width: 100%;
    width: 100%;
}

.item-container {
    width: 100%;
    display: flex;
    overflow-x: hidden;
    mask-size: 100% 100%;
    mask-position: center;
    mask-repeat: no-repeat;
    mask-composite: intersect;
    transition: mask 0.3s;
}

.single-item {
    display: inline-block;
    margin: 5px 15px;
}

.control-row {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.control-title {
    opacity: 0.8;
    font-weight: 400;
}

.column:first-child > .single-item {
    margin-left: 0;
}

.column:last-child > .single-item {
    margin-right: 0;
}

.right-control {
    display: flex;
    align-items: center;
}

.scroll-progress {
    opacity: 0.8;
    font-size: 14px;
}

</style>