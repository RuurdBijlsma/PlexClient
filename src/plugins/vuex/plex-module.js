import PlexAPI from "plex-api";
import qs from "qs";
import {parseString as parseXml} from "xml2js";

export default {
    state: {
        host: '127.0.0.1',
        port: 32400,
        server: null,
        user: {
            email: '',
            profile: null,
            services: null,
            image: '',
            title: '',
            username: '',
            uuid: '',
        },
        credentials: {
            auth: null,
            token: '',
            expires: 0,
        },
    },
    mutations: {
        server: (state, server) => state.server = server,
        user: (state, user) => state.user = user,
        auth: (state, auth) => state.credentials.auth = auth,
        credentials: (state, {token, expires}) => {
            state.credentials.token = token;
            state.credentials.expires = expires;
        },
    },
    getters: {
        tvAuth: state => state.credentials.auth,
        tvLoggedIn: (state, getters) => getters.tvAuth !== null &&
            getters.tvAuth.authToken !== null &&
            new Date(getters.tvAuth.expiresAt) > new Date(),
        plexApi: (state) => {
            let api = new PlexAPI({
                hostname: state.host,
                port: state.port,
                username: state.credentials.username,
                password: state.credentials.password,
            });
            console.log(api);
            return api;
        },
    },
    actions: {
        // ----------------------------------------------------------------------- //
        // ------------------------- Local plex API ------------------------------ //
        // ----------------------------------------------------------------------- //
        async find({getters}, {options, criteria}) {
            try {
                return await getters.plexApi.find(options, criteria);
            } catch (e) {
                console.warn("Error in find to:", options, e);
                return false;
            }
        },
        async query({getters}, {options, method = 'GET'}) {
            try {
                method = method.toUpperCase();
                return await getters.plexApi[{
                    PERFORM: 'perform',
                    GET: 'query',
                    POST: 'postQuery',
                    PUT: 'putQuery',
                    DELETE: 'deleteQuery'
                }[method]](options);
            } catch (e) {
                console.warn(`Error in ${method} query to:`, options, {e});
                return false;
            }
        },
        async testPlex({dispatch}) {
            let result = dispatch('query', {options: '/'});
            if (!result)
                return result;
            console.log(`${result.friendlyName} running Plex Media Server v${result.version}`);

            // array of children, such as Directory or Server items
            // will have the .uri-property attached
            console.log(result._children);
        },
        // -------------------------------------------------------------------- //
        // ------------------------- plex.tv API ------------------------------ //
        // -------------------------------------------------------------------- //
        async updateServerInfo({commit, getters}) {
            // this is how we get servers connected to this account
            if (!getters.tvLoggedIn) {
                console.warn("Not logged in; can't update server info");
                return;
            }
            let serverInfo = await fetch('https://plex.tv/api/v2/resources?' + qs.stringify({
                'X-Plex-Product': getters.tvAuth.product,
                'X-Plex-Client-Identifier': getters.tvAuth.clientIdentifier,
                'X-Plex-Token': getters.tvAuth.authToken,
            }), {
                headers: {accept: 'application/json'}
            }).then(d => d.json());
            console.log(serverInfo);
            // const server = {
            //     email: serverInfo.email,
            //     profile: serverInfo.profile,
            //     services: serverInfo.services,
            //     image: serverInfo.thumb,
            //     title: serverInfo.title,
            //     username: serverInfo.username,
            //     uuid: serverInfo.uuid,
            // };
            // commit('server', server);
            // return server;
        },
        async updateUserInfo({commit, getters}) {
            if (!getters.tvLoggedIn) {
                console.warn("Not logged in; can't update user info");
                return;
            }
            let userInfo = await fetch('https://plex.tv/api/v2/user?' + qs.stringify({
                'X-Plex-Product': getters.tvAuth.product,
                'X-Plex-Client-Identifier': getters.tvAuth.clientIdentifier,
                'X-Plex-Token': getters.tvAuth.authToken,
            }), {headers: {accept: 'application/json'}}).then(d => d.json());
            const user = {
                email: userInfo.email,
                profile: userInfo.profile,
                services: userInfo.services,
                image: userInfo.thumb,
                title: userInfo.title,
                username: userInfo.username,
                uuid: userInfo.uuid,
            };
            commit('user', user);
            return user;
        },
        async initializeAuth({state, commit, dispatch}) {
            console.log("INIITALZING AUTH");
            if (state.credentials.auth === null) {
                let auth = await dispatch('firstLogin')
                console.log("AUTH", auth);
                if (auth.errors) {
                    console.warn("AUTH ERROR", auth);
                    return;
                } else {
                    commit('auth', auth);
                }
            }
            const timeMargin = 1000 * 60;
            let auth = state.credentials.auth;
            if (!auth.authToken || new Date() - timeMargin * 2 > new Date(auth.expiresAt)) {
                console.log("expired, getting new token");

                auth = await fetch(`https://plex.tv/api/v2/pins/${auth.id}?` + qs.stringify({
                    code: auth.code,
                    'X-Plex-Client-Identifier': auth.clientIdentifier,
                }), {
                    headers: {
                        accept: 'application/json',
                    },
                }).then(d => d.json());
                if (auth.errors) {
                    console.warn("AUTH ERROR", auth);
                    return;
                } else {
                    commit('auth', auth);
                }
            } else {
                console.log("AUth is still FRESH");
            }
            let timeToExpire = new Date(auth.expiresAt) - new Date();
            // refresh 1 minute before expiry
            setTimeout(() => {
                dispatch("initializeAuth");
            }, timeToExpire - timeMargin);
        },
    },
    modules: {}
}
