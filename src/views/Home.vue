<template>
    <div class="home">
        <v-avatar>
            <v-img :src="user.image"></v-img>
        </v-avatar>
        <span> Hello {{ user.username }} </span>
        <br>
        <router-link to="/about">about</router-link>
    </div>
</template>

<script>
import {mapState} from "vuex";

export default {
    name: 'Home',
    components: {},
    computed: {
        ...mapState({
            user: state => state.plex.user,
        }),
    }
}
</script>
<style scoped>
.home {
    padding: 10px 30px;
}
</style>