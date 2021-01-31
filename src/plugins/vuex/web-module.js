import qs from "qs";

export default {
    state: {
        type: 'web',
        channel: null,
    },
    mutations: {
        channel: (state, channel) => state.channel = channel,
    },
    getters: {},
    actions: {
        initializePlatform: async ({state, commit, dispatch, getters, rootState}) => {
        },
        setPlatformPlaying: ({state}, playing) => {
        },
        resetPlexLogin({state, commit}) {
            if (state.channel !== null) {
                state.channel.close();
                commit('channel', null);
            }
        },
        login({state,commit}){
            return new Promise(async resolve => {
                let info = {
                    clientId: "RuurdPlexClient",                    // This is a unique identifier used to identify your app with Plex.
                    name: "Ruurd's Plex Client",                    // Name of your application
                    device: "Plex Web",                             // The type of device your application is running on
                    version: "0.1.0",                               // Version of your application
                    platform: "Web",                                // Optional - Platform your application runs on - Defaults to 'Web'
                }
                let auth = await fetch(
                    `https://plex.tv/api/v2/pins?strong=true&X-Plex-Product=${info.name}&X-Plex-Client-Identifier=${info.clientId}`, {
                        method: 'POST',
                        headers: {
                            accept: 'application/json',
                        },
                    }).then(d => d.json());

                let redirectUrl = location.origin + (location.pathname + (location.pathname.endsWith('/') ? '' : '/'))
                    .replace(/\/\//gi, '/') + '?plex_auth=yes'
                const authUrl = 'https://app.plex.tv/auth#?' +
                    qs.stringify({
                        clientID: info.clientId,
                        code: auth.code,
                        forwardUrl: redirectUrl,
                        context: {
                            device: {
                                product: info.name,
                            },
                        },
                    });

                window.open(authUrl);

                if (state.channel)
                    state.channel.close();
                let channel = new BroadcastChannel('loginCode');
                commit('channel', channel);
                channel.onmessage = msg => {
                    console.log('received msg');
                    channel.close();
                    commit('channel', null);
                    resolve(auth);
                }
            });
        },
    },
}