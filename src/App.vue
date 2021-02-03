<template>
    <v-app class="app" :style="{
        fontWeight: $vuetify.theme.dark ? 300 : 500,
        '--primary': themeColors.primary,
        '--foreground': themeColors.foreground,
        '--softForeground':themeColors.softForeground,
        '--hardBackground': themeColors.hardBackground,
        '--softBackground': themeColors.softBackground,
        '--softerBackground':themeColors.softerBackground,
        '--secondary': themeColors.secondary,
    }">
        <div>
            <div class="background" :style="{
                backgroundImage: `url(${bgImg[$vuetify.theme.dark ? 'dark' : 'light']})`,
                transition: `background-image ${bgTransition}`,
                maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, ${$vuetify.theme.dark ? 0.3 : 0.2}) 10%, rgba(0, 0, 0, ${$vuetify.theme.dark ? 0.7 : 0.4}) 95%)`,
            }"/>
            <div class="blur"/>
            <div class="gradient" :scrolled="scrollY > 50"/>
        </div>
        <app-bar class="appbar"/>
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
// /show and /season can be one component, structure is similar
// implement /season
// implement /movie
// Implement /library/movies
// Implement /shows
// Implement /movies
// Implement /home

// make sure everything that should be clickable is clickable (every time a show title is mentioned, etc.)
// scrollIntoView scrolls vertically 🤮
// Add not found image to mediaItem (different per type)
// Make MediaItem work with more item types
// get sorts for a sections with /library/sections/key/sorts
// get filters for a sections with /library/sections/key/filters

// Find way around cors for offline images
// Windows media controls integration
// If show is in library of similar shows, show this visually and allow click on that show to go there
// Add setting to remove current wallpaper
// Add setting to get new wallpaper
// Resizable scale for views such as library and explore (make css var --scale and multiply sizes with that)
// Implement search (with autocomplete)
// Fix close button
// Implement season page
// Implement episode / movie page
// Implement video player (video for web, vlc-video for electron) (big work)
// Implement controls while browsing with animation when switching
// Theme color based on artwork of episode/show/movie page?
// Improve icon (more contrast?) idk
// Switch to bottom bar navigation for small screen
// Implement server settings in settings (maybe steal settings layout from Plex)
// Add sonarr domain input for similar shows linking
// Keyboard shortcuts
// Auto updater in release build
// Playlists 'n stuff
// Plex subtitles, how do they work
// Add download for offline functionality
// Improve new blurry background getting experience
//   (maybe first time use default, then on load blurry background for next launch)


// ----------------------------------------- DONE -----------------------------------------------
// Change :to in mediaitem to /show/9228 etc.
// Implement /library/shows
// Make GlowImage component
// Implement cached (caches) blob getter (for thumbnails mostly)
//   (can i make generalized get result instant and update when it's retrieved?)

export default {
    name: 'App',
    components: {AppBar},
    data: () => ({
        bgTransition: '0s',
        bgImg: {
            dark: '',
            light: '',
        },
        scrollInterval: -1,
    }),
    beforeDestroy() {
        document.removeEventListener('keypress', this.devListener);
        window.removeEventListener('scroll', this.updateScroll);
        clearInterval(this.scrollInterval);
    },
    async mounted() {
        console.log('store', this.$store);
        console.log('route', this.$route);

        this.handleCode();
        this.updatePublicIp().then();
        document.addEventListener('online', () => this.updatePublicIp());
        document.addEventListener('keypress', this.devListener);
        window.addEventListener('scroll', this.updateScroll, false);
        setTimeout(() => this.bgTransition = '.6s', 500);
        Utils.getCachedBackgrounds().then(bg => this.bgImg = bg);

        this.$store.restored.then(() => {
            if (this.$route.path !== '/settings' && this.server === null)
                this.$router.push('/settings');
            if (this.canQuery)
                this.updateSections();
        });
    },
    methods: {
        handleCode() {
            if (location.search.includes('?plex_auth=')) {
                let otherTab = new BroadcastChannel('loginCode');
                otherTab.postMessage('Plex auth completed');
                otherTab.close();
                window.close();
            }
        },
        updateScroll() {
            this.$store.commit('scrollY', window.scrollY)
        },
        devListener(e) {
            if (e.key === '`' && this.platform === 'electron')
                this.$store.dispatch('openDevTools');
            if (e.key === 'r' && e.ctrlKey)
                location.reload();
        },
        ...mapActions(['updateUserInfo', 'updateServices', 'updatePublicIp', 'updateSections']),
    },
    computed: {
        ...mapGetters(['themeColors']),
        ...mapState({
            platform: state => state.platform.type,
            server: state => state.plex.server,
            scrollY: state => state.scrollY,
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
    overflow-x: auto;
    user-select: none;
}

/*.router-link-active {*/
/*    color: var(--foreground) !important;*/
/*    text-decoration: none;*/
/*}*/

/*.router-link-active:hover {*/
/*    text-decoration: underline;*/
/*}*/

.appbar {
    z-index: 11;
}

.background, .blur, .gradient {
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}

.background {
    background-size: cover !important;
    background-position: center !important;
    transition: background 1s;
}

.blur {
    backdrop-filter: blur(calc(10px + 2vw)) saturate(120%);
}

.gradient {
    z-index: 5;
    pointer-events: none;
    transition: background-position-y 0.5s;
    background-image: linear-gradient(to bottom, var(--hardBackground) 4%, rgba(0, 0, 0, 0) 18%);
    background-position-y: -50px;
}

.gradient[scrolled] {
    background-position-y: 0px;
}
</style>