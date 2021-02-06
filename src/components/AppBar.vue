<template>
    <v-app-bar dense prominent
               app elevation="0" color="transparent"
               class="app-bar">
        <div class="app-bar-content">
            <router-link to="/"
                         :style="{backgroundImage: `url(img/plex-text-${$vuetify.theme.dark ? 'white' : 'black'}.png)`}"
                         class="text-logo"/>
            <div class="links" v-if="canQuery">
                <router-link class="no-drag" color="foreground" to="/" exact>Home</router-link>
                <router-link class="no-drag" color="foreground"
                             :to="`/explore/${section.key}`" exact
                             v-for="section in sections">
                    {{ section.title }}
                </router-link>
                <v-menu open-on-hover offset-y content-class="elevation-0">
                    <template v-slot:activator="{ on, attrs }">
                    <span class="no-drag library-link"
                          :class="{'router-link-active': $route.fullPath.startsWith('/library')}"
                          v-bind="attrs"
                          v-on="on">
                        Library <v-icon>mdi-chevron-down</v-icon>
                    </span>
                    </template>
                    <v-list rounded dense class="no-drag">
                        <v-list-item :to="`/library/${section.key}`" v-for="section in sections">
                            <v-list-item-icon>
                                <v-icon v-if="section.type === 'show'">mdi-television-classic</v-icon>
                                <v-icon v-else>mdi-movie-open-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ section.title }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
            <div class="header-right">
                <search-field class="no-drag mr-2"/>
                <v-menu offset-y :close-on-content-click="true">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="primary"
                            class="no-drag"
                            icon
                            v-bind="attrs"
                            v-on="on">
                            <v-icon>mdi-account-circle</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item two-line v-if="$store.state.plex.user !== null">
                            <v-list-item-avatar>
                                <v-img :src="$store.state.plex.user.image"/>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ $store.state.plex.user.username }}</v-list-item-title>
                                <v-list-item-title>
                                    <v-btn class="logout-button" @click="logout" small plain>Log out</v-btn>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item to="/settings">
                            <v-list-item-icon>
                                <v-icon>mdi-cog-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>Settings</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item color="primary" class="center-list-item">
                            <v-list-item-icon>
                                <v-icon>mdi-brightness-6</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="theme-switch">
                                    <span>Dark theme</span>
                                </v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-switch hide-details dense inset v-model="$vuetify.theme.dark"></v-switch>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <div v-if="platform === 'electron'">
                    <v-btn icon @click="minimizeWindow" class="no-drag">
                        <v-icon>mdi-minus</v-icon>
                    </v-btn>
                    <v-btn icon @click="closeWindow" class="no-drag">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
    </v-app-bar>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import PlexImage from "@/components/PlexImage";
import SearchField from "@/components/SearchField";

export default {
    name: "AppBar",
    components: {SearchField, PlexImage},
    methods: {
        async logoutAndRedirect() {
            await this.logout();
            await this.$router.push('/settings');
        },
        ...mapActions(['closeWindow', 'minimizeWindow', 'logout']),
    },
    computed: {
        ...mapGetters(['canQuery']),
        ...mapState({
            platform: state => state.platform.type,
            sections: state => state.plex.content.sections,
        }),
    },
}
</script>

<style scoped>
.app-bar-content {
    -webkit-app-region: drag;
    align-items: center;
    justify-content: space-between;
    display: flex;

    width: calc(100% - 10px);
    margin: 5px 0 0;
    height: calc(100% - 5px) !important;
}

.no-drag, .no-drag >>> * {
    -webkit-app-region: no-drag;
}

.text-logo {
    cursor: pointer;
    margin: 0 0 0 30px;
    width: 75px;
    height: 40px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}

.links {
    height: 100%;
    display: flex;
    align-items: center;
}

.links > a, .library-link {
    color: var(--foreground);
    text-decoration: none;
    font-size: 16px;
    margin: 0 20px;
    opacity: 0.6;
    transition: opacity 0.2s;
    display: inline-flex;
    height: 50px;
    line-height: 50px;
    vertical-align: middle;
}

.links .router-link-active {
    opacity: 1;
}

.header-right {
    height: 100%;
    align-items: center;
    display: flex;
}

.center-list-item button {
    margin-left: 0.5em;
}

.center-list-item {
    height: 40px;
}
</style>