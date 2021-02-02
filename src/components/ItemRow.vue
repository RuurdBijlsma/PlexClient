<template>
    <div class="item-row">
        <div class="control-row">
            <h3>{{ title }}</h3>
            <div class="right-control" v-if="itemGroups.length > itemsPerPage">
<!--                <span class="scroll-progress mr-2">-->
<!--                    {{ (inView * rows) + 1 }} / {{ items.length }}-->
<!--                </span>-->
                <v-btn :disabled="!contentLeft || inView <= minIndex" icon class="mr-2" plain @click="scrollRow(-3)">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn :disabled="!contentRight || inView >= itemGroups.length - 1" icon plain @click="scrollRow(3)">
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
        </div>
        <div class="item-container" ref="container" :style="{
            maskImage: `linear-gradient(to right, rgba(0, 0, 0, ${contentLeft ? 0 : 1}) 0%, rgba(0, 0, 0, 1) 15%),
linear-gradient(to left, rgba(0, 0, 0, ${contentRight ? 0 : 1}) 0%, rgba(0, 0, 0, 1) 15%)`,
        }">
            <div class="column" v-for="itemGroup in itemGroups" ref="columns">
                <media-item v-for="item in itemGroup"
                            :size="size"
                            :type="type"
                            class="single-item"
                            :item="item"></media-item>
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
    },
    data: () => ({
        scrollLeft: 0,
        inView: 0,
        offsetWidth: 0,
    }),
    beforeDestroy() {
        this.$refs.container.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('resize', this.resizeListener);
    },
    mounted() {
        this.resizeListener();
        this.inView = this.minIndex;
        window.addEventListener('resize', this.resizeListener, false);
        this.scrollListener();
        this.$refs.container.addEventListener('scroll', this.scrollListener, false);
    },
    methods: {
        resizeListener() {
            this.offsetWidth = this.$refs.container?.offsetWidth ?? 0;
        },
        scrollListener() {
            this.scrollLeft = this.$refs.container?.scrollLeft ?? 0;
        },
        scrollRow(x) {
            let columns = this.$refs.columns;
            this.inView = Math.max(this.minIndex, Math.min(this.inView + x, columns.length - 1));
            console.log(this.inView);
            columns[this.inView].scrollIntoView({
                inline: 'end',
                behavior: "smooth",
            });
        },
    },
    computed: {
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
            return (this.$refs.container?.scrollWidth ?? 0) - (this.scrollLeft + this.offsetWidth);
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

.control-row > h3 {
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