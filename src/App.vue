<template>
    <v-app class="app" :style="{
        '--primary': themeColors.primary,
        '--foreground': themeColors.foreground,
        '--softForeground':themeColors.softForeground,
        '--softBackground': themeColors.softBackground,
        '--softerBackground':themeColors.softerBackground,
        '--secondary': themeColors.secondary,
    }">
        <div>
            <div class="background" :style="{
                backgroundImage: `url(${bgImg[$vuetify.theme.dark ? 'dark' : 'light']})`,
                transition: `background-image ${bgTransition}`,
            }"/>
            <div class="blur"/>
        </div>
        <app-bar/>
        <v-main>
            <router-view/>
        </v-main>
    </v-app>
</template>

<script>
import AppBar from "@/components/AppBar";
import {mapActions, mapGetters, mapState} from "vuex";
import Utils from "@/js/Utils";

// TODO
// Add setting to remove current wallpaper
// Add setting to get new wallpaper
// Resizable scale for views such as library and explore (make css var --scale and multiply sizes with that)
// Implement /library/shows
// Implement /library/movies
// Implement /shows
// Implement /movies
// Implement /home
// Implement search (with autocomplete)
// Fix close button
// Implement season page
// Implement episode / movie page
// Implement cached (caches) blob getter (for thumbnails mostly)
//   (can i make generalized get result instant and update when it's retrieved?)
// Implement video player (video for web, vlc-video for electron) (big work)
// Implement controls while browsing with animation when switching
// Theme color based on artwork of episode page?
// Improve icon (more contrast?) idk
// Switch to bottom bar navigation for small screen
// Implement server settings in settings (maybe steal settings layout from Plex)
// Keyboard shortcuts
// Auto updater in release build
// Playlists 'n stuff
// Plex subtitles, how do they work
// Add download for offline functionality
// Improve new blurry background getting experience
//   (maybe first time use default, then on load blurry background for next launch)

export default {
    name: 'App',
    components: {AppBar},
    data: () => ({
        bgTransition: '0s',
        bgImg: {
            dark: '',
            light: '',
        },
    }),
    beforeDestroy() {
        document.removeEventListener('keypress', this.devListener);
    },
    async mounted() {
        this.updatePublicIp().then();
        document.addEventListener('online', () => {
            this.updatePublicIp();
            console.log("online event");
        });
        if (this.$route.path !== '/settings' && this.server === null)
            await this.$router.push('/settings');
        document.addEventListener('keypress', this.devListener);
        console.log('store', this.$store);
        console.log('route', this.$route);
        setTimeout(() => {
            this.bgTransition = '.6s';
        }, 500);
        Utils.getCachedBackgrounds().then(bg => this.bgImg = bg);
    },
    methods: {
        devListener(e) {
            if (e.key === '`' && this.platform === 'electron')
                this.$store.dispatch('openDevTools');
            if (e.key === 'r' && e.ctrlKey)
                location.reload();
        },
        ...mapActions(['initializeAuth', 'updateUserInfo', 'updateServices', 'updatePublicIp']),
    },
    computed: {
        ...mapGetters(['themeColors']),
        ...mapState({
            platform: state => state.platform.type,
            server: state => state.plex.server,
        }),
    },
    watch: {
        '$vuetify.theme.dark'() {
            localStorage.darkTheme = this.$vuetify.theme.dark;
        },
    },
};
</script>
<style>
html {
    overflow-y: auto;
}

.background, .blur {
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}

.background {
    background-size: cover !important;
    background-position: center !important;
    transition: background-image 1s;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 10%, rgba(0, 0, 0, 0.6) 95%);
}

.blur {
    backdrop-filter: blur(3.5vw) saturate(100%);
}
</style>