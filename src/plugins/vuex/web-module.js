export default {
    state: {
        type: 'web',
        channel: null,
    },
    mutations: {
        channel: (state, channel) => state.channel = channel,
    },
    getters: {
        betterFetch: () => () => window.fetch,
    },
    actions: {
        async closeWindow({}) {
        },
        async minimizeWindow({}) {
        },
        initializePlatform: async ({}) => {
        },
        updateThumbar: ({}) => {
        },
        resetPlexLogin({state, commit}) {
            if (state.channel !== null) {
                state.channel.close();
                commit('channel', null);
            }
        },
        getRedirectUrl() {
            return location.origin + (location.pathname + (location.pathname.endsWith('/') ? '' : '/'))
                .replace(/\/\//gi, '/') + '?plex_auth=yes'
        },
        goToUrl({state, commit}, url) {
            return new Promise(resolve => {
                console.log(url)
                window.open(url);

                if (state.channel)
                    state.channel.close();
                let channel = new BroadcastChannel('loginCode');
                commit('channel', channel);
                channel.onmessage = () => {
                    console.log('received msg');
                    channel.close();
                    commit('channel', null);
                    resolve();
                };
            });
        },
    },
}