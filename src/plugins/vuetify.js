import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

let dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if (localStorage.getItem('darkTheme') !== null)
    dark = localStorage.darkTheme === 'true';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark,
        themes: {
            dark: {
                primary: '#e58e13',
                foreground: '#ffffff',
                hardBackground: '#000000',
                softForeground: '#d6d6d6',
                softBackground: '#282727',
                softerBackground: '#39393e',
                secondary: '#4a1bcf',
            },
            light: {
                primary: '#ff7800',
                foreground: '#17181a',
                hardBackground: '#ffffff',
                softForeground: '#353535',
                softBackground: '#f1efef',
                softerBackground: '#cdcdcd',
                secondary: '#4a1bcf',
            },
        },
    }
});