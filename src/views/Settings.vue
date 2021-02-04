<template>
    <div class="settings">
        <h2>Settings</h2>
        <v-divider class="mb-3"></v-divider>
        <div class="login">
            <h3 class="mt-3 mb-3">Account</h3>
            <div v-if="!tvLoggedIn && server === null">
                <v-btn @click="login" color="primary" rounded :loading="loginLoading" outlined>
                    <v-icon class="mr-2">mdi-plex</v-icon>
                    Login in to Plex
                </v-btn>
                <v-btn v-if="loginLoading" icon @click="cancelLogin">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
            <div v-else>
                <v-list-item>
                    <v-list-item-avatar>
                        <v-avatar>
                            <v-img :src="user.image"></v-img>
                        </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>{{ user.username }}</v-list-item-title>
                        <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn @click="logout" text>Log out</v-btn>
                    </v-list-item-action>
                </v-list-item>
            </div>
        </div>
        <div class="server-list" v-if="tvServers.length > 0">
            <h3 class="mt-3 mb-3">Servers</h3>
            <v-card v-for="tvServer in tvServers" outlined>
                <v-card-title>
                    <v-icon color="primary" class="mr-2" v-if="server.clientIdentifier === tvServer.clientIdentifier">
                        mdi-check
                    </v-icon>
                    {{ tvServer.name }}
                </v-card-title>
                <v-card-subtitle>{{ tvServer.product }} • {{ tvServer.device }} • {{
                        tvServer.platform
                    }}
                </v-card-subtitle>
                <v-card-text>
                    <div>Created at: <span class="server-value">{{ toDateString(tvServer.createdAt) }}</span></div>
                    <div>Public address: <span class="server-value">{{ tvServer.publicAddress }}</span></div>
                    <div>Port: <span class="server-value">{{ getServerPort(tvServer) }}</span></div>
                    <div>Currently local:
                        <span class="server-value" v-if="tvServer.publicAddress === publicIp">
                            <v-icon small color="success">mdi-lan</v-icon>
                            Yes
                        </span>
                        <span class="server-value" v-else>
                            <v-icon small color="primary">mdi-earth</v-icon>
                            No
                        </span>
                    </div>
                </v-card-text>
                <v-card-actions v-if="tvServers.length > 1">
                    <v-spacer></v-spacer>
                    <v-btn @click="markPrimaryServer(tvServer)" text color="primary">Mark as primary server</v-btn>
                </v-card-actions>
            </v-card>
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import Utils from "@/js/Utils";

export default {
    name: 'Settings',
    data: () => ({
        loginLoading: false,
    }),
    methods: {
        logout() {
            this.$store.commit('user', {
                email: '',
                profile: null,
                services: null,
                image: '',
                title: '',
                username: '',
                uuid: '',
            });
            this.$store.commit('server', null);
            this.$store.commit('auth', null)
            this.$store.commit('services', []);
        },
        cancelLogin() {
            this.resetPlexLogin();
            this.loginLoading = false;
        },
        async login() {
            this.loginLoading = true;
            await this.ensureAuth();
            this.updateUserInfo().then();
            this.updateServices().then(()=>{
                if (this.canQuery)
                    this.updateSections().then();
            });
            this.loginLoading = false;
        },
        toDateString(d) {
            return Utils.niceDate(new Date(d));
        },
        ...mapActions(['markPrimaryServer', 'ensureAuth', 'updateUserInfo', 'updateServices', 'resetPlexLogin', 'updateSections']),
    },
    computed: {
        ...mapGetters(['tvServers', 'tvLoggedIn', "getServerPort", 'canQuery']),
        ...mapState({
            server: state => state.plex.server,
            user: state => state.plex.user,
            publicIp: state => state.plex.publicIp,
        }),
    },
}
</script>
<style scoped>
.settings {
    padding: 10px 30px;
    max-width: 600px;
    margin: 0 auto;
}

.server-list {

}

.server-value {
    color: var(--foreground);
}
</style>