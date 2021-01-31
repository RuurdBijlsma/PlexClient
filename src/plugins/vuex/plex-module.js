import PlexAPI from 'plex-api';
import qs from "qs";
import publicIp from "public-ip";
import Vue from 'vue';

export default {
    state: {
        sortLibrary: {},
        content: {
            library: null,
            sections: null,
            onDeck: null,
            recentlyAdded: null,
        },
        publicIp: '',
        server: null,
        services: [],
        user: {
            email: '',
            profile: null,
            services: null,
            image: '',
            title: '',
            username: '',
            uuid: '',
        },
        auth: null,
    },
    mutations: {
        content: (state, {key, content}) => Vue.set(state.content, key, content),
        publicIp: (state, publicIp) => state.publicIp = publicIp,
        services: (state, services) => state.services = services,
        server: (state, server) => state.server = server,
        user: (state, user) => state.user = user,
        auth: (state, auth) => state.auth = auth,
    },
    getters: {
        getServerPort: () => server => server?.connections.slice()
            ?.sort((a, b) => a?.relay - b?.relay)
            ?.sort((a, b) => b?.local - a?.local)?.[0]?.port,
        port: (state, getters) => getters.getServerPort(state.server),
        token: state => state.server?.accessToken,
        canQuery: (state, getters) => getters.port &&
            state.server.publicAddress &&
            state.server?.accessToken !== null &&
            state.server?.accessToken !== undefined,
        tvServers: state => state.services.filter(s => s.provides.includes('server')),
        tvAuth: state => state.auth,
        tvLoggedIn: (state, getters) => getters.tvAuth !== null &&
            getters.tvAuth.authToken !== null &&
            new Date(getters.tvAuth.expiresAt) > new Date(),
        plexApi: (state, getters) => {
            let api = new PlexAPI({
                hostname: state.server.publicAddress,
                port: getters.port,
                token: getters.token,
            });
            console.log(api);
            return api;
        },
        plexUrl: (state, getters) => url => getters.plexApi._generateRelativeUrl(url) +
            '&' + qs.stringify(({'X-Plex-Token': state.server.accessToken})),
        transcodeUrl: (state, getters) => ({
                                               url,
                                               width,
                                               height
                                           }) => getters.plexUrl('/photo/:/transcode/?' + qs.stringify({
            width, height, url,
        })),
    },
    actions: {
        async updatePublicIp({commit}) {
            let ip = await publicIp.v4();
            commit('publicIp', ip);
        },
        // ----------------------------------------------------------------------- //
        // ------------------------- Local plex API ------------------------------ //
        // ----------------------------------------------------------------------- //
        async offlinePlexImg({}, url) {
            const cacheStorage = await caches.open(this.cacheName);
            let res = await cacheStorage.match(url);
            if(!res)
                return null;
            return URL.createObjectURL(await res.blob())
        },
        async onlinePlexImg({state, dispatch, commit, getters}, url) {
            const cacheStorage = await caches.open(this.cacheName);
            let fresh = await fetch(url);
            await cacheStorage.put(url, fresh);
            let res = await cacheStorage.match(url);
            return URL.createObjectURL(await res.blob());
        },
        async updateLibraryDirectory({state, dispatch, commit}, {sectionKey, directory}) {
            let content = await dispatch('query', {url: `/library/sections/${sectionKey}/${directory}`});
            commit('content', {key: 'sectionLibrary' + sectionKey + '|' + directory, content: content});
            return content;
        },
        async updateSectionLibrary({state, dispatch, commit}, sectionKey) {
            let content = await dispatch('query', {url: `/library/sections/${sectionKey}`});
            commit('content', {key: 'sectionLibrary' + sectionKey, content: content});
            return content;
        },
        async updateRecentlyAdded({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library/recentlyAdded'});
            commit('content', {key: 'recentlyAdded', content: content.Metadata});
            return content.Metadata;
        },
        async updateOnDeck({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library/onDeck'});
            commit('content', {key: 'onDeck', content: content.Metadata});
            return content.Metadata;
        },
        async updateSections({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library/sections', timeout: 1000 * 60 * 60 * 2});
            commit('content', {key: 'sections', content: content.Directory});
            return content.Directory;
        },
        async updateLibrary({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library'});
            commit('content', {key: 'library', content: content.Directory});
            return content.Directory;
        },
        async find({getters, dispatch}, {url, criteria}) {
            if (!getters.canQuery)
                return console.warn("Can't find query :(, todo, do something here (redirect to settings? tell user)");
            try {
                let key = 'find' + JSON.stringify({url, criteria});
                let fun = getters.plexApi.find(url, criteria);
                return await dispatch('getCached', {fun, key});
            } catch (e) {
                console.warn("Error in find to:", url, e);
                return false;
            }
        },
        async query({state, getters, commit, dispatch}, {url, method = 'GET', lifetime = 3000}) {
            if (!getters.canQuery)
                return console.warn("Can't query :(, todo, do something here (redirect to settings? tell user)");
            try {
                method = method.toUpperCase();
                let key = 'query' + method + JSON.stringify(url);
                let fun = async () => {
                    let result = await getters.plexApi[{
                        PERFORM: 'perform',
                        GET: 'query',
                        POST: 'postQuery',
                        PUT: 'putQuery',
                        DELETE: 'deleteQuery'
                    }[method]](url);
                    return result.MediaContainer;
                };
                return await dispatch('getCached', {fun, key, lifetime});
            } catch (e) {
                console.warn(`Error in ${method} query to:`, url, {e});
                return false;
            }
        },
        // -------------------------------------------------------------------- //
        // ------------------------- plex.tv API ------------------------------ //
        // -------------------------------------------------------------------- //
        markPrimaryServer({commit, getters}, server) {
            commit('server', server);
            // Todo maybe check if auth token of server works and give feedback of this async checking
        },
        async updateServices({state, commit, dispatch, getters}) {
            // this is how we get servers and players connected to this account
            let services = await dispatch('tvQuery', {endpoint: 'resources'});
            commit('services', services);
            if (state.server === null && getters.tvServers.length > 0) {
                commit('server', getters.tvServers[0]);
            }
            return services;
        },
        async updateUserInfo({commit, dispatch}) {
            let userInfo = await dispatch('tvQuery', {endpoint: 'user'});
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
        async tvQuery({getters}, {endpoint = 'user', method = 'GET', extraHeaders = {}, extraQuery = {}}) {
            if (!getters.tvLoggedIn)
                return console.warn("Not logged in; can't query", {endpoint, method, extraHeaders, extraQuery});
            return await fetch(`https://plex.tv/api/v2/${endpoint}?` + qs.stringify({
                'X-Plex-Product': getters.tvAuth.product,
                'X-Plex-Client-Identifier': getters.tvAuth.clientIdentifier,
                'X-Plex-Token': getters.tvAuth.authToken,
                ...extraQuery,
            }), {
                headers: {
                    accept: 'application/json',
                    ...extraHeaders,
                }
            }).then(d => d.json());
        },
        async ensureAuth({commit, dispatch, getters}) {
            console.log("ENSURING AUTH");
            if (getters.tvLoggedIn)
                return;

            let auth = await dispatch('login')
            console.log("AUTH", auth);
            if (auth.errors)
                return console.warn("AUTH ERROR", auth);
            else
                commit('auth', auth);

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
            } else {
                commit('auth', auth);
            }
        },
    },
    modules: {}
}
