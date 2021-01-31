import {get, keys, set, clear} from "idb-keyval";

export default class Utils {
    static isTouchDevice() {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
    }

    /**
     * @param {string} url
     * @returns {Promise<HTMLImageElement>}
     */
    static async loadImage(url) {
        let blob = await fetch(url).then(r => r.blob());
        let dataUrl = await new Promise(resolve => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = dataUrl;
            img.onload = () => resolve(img);
            img.onerror = reject;
        })
    }

    static async getCachedBackgrounds() {
        let bgsInCache = await get('bgsInCache') ?? 0;
        let useNew = bgsInCache === 0 ? true : Math.random() < 0.2;
        if (useNew) {
            try {
                console.log("Getting new background");
                let dark = [], light = [];
                while (dark.length === 0 || light.length === 0) {
                    let site = Math.random() > 0.5 ? 'picsum' : 'unsplash';
                    let result = await Utils.getBackground(480, 360, site);
                    if (result.dark)
                        dark.push(result);
                    else
                        light.push(result);
                }
                let bgs = {dark: dark[0].url, light: light[0].url};
                await set('background' + bgsInCache, bgs);
                await set('bgsInCache', bgsInCache + 1);
                return bgs;
            } catch (e) {
                console.warn('get bg error', e);
            }
        }
        console.log("Getting cached background");
        return await get('background' + Math.floor(Math.random() * bgsInCache));
    }


    /**
     * Returns dataUrl for image and boolean indicating whether it should be used in dark theme
     * @param {int} width
     * @param {int} height
     * @param {('picsum'|'unsplash')} srcSite
     * @returns {Promise<{url: string, dark: boolean}>}
     */
    static async getBackground(width = 480, height = 360, srcSite = 'picsum') {
        let url = srcSite === 'picsum' ?
            `https://picsum.photos/${width}/${height}` :
            `https://source.unsplash.com/random/${width}x${height}`;
        let img = await Utils.loadImage(url);
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        let imgData = context.getImageData(0, 0, img.width, img.height);
        let totalLuminance = 0;
        for (let i = 0; i < imgData.data.length; i += 4) {
            let [r, g, b, a] = imgData.data.slice(i, i + 4);
            let [h, s, l] = Utils.rgbToHsl(r, g, b);
            totalLuminance += l;
        }
        let avgLuminance = totalLuminance / (imgData.data.length / 4);
        let dark = avgLuminance < 0.4;
        let desiredLuminance = dark ? 0.1 : 0.9;
        for (let i = 0; i < imgData.data.length; i += 4) {
            let [r, g, b, a] = imgData.data.slice(i, i + 4);
            let [h, s, l] = Utils.rgbToHsl(r, g, b);
            l *= Math.min(1, Math.max(0, desiredLuminance / avgLuminance));
            [r, g, b] = Utils.hslToRgb(h, s, l);
            imgData.data[i] = r;
            imgData.data[i + 1] = g;
            imgData.data[i + 2] = b;
        }
        context.putImageData(imgData, 0, 0);

        console.log(avgLuminance);
        return {url: canvas.toDataURL(), dark}
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {[int, int, int]}           The RGB representation
     */
    static hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   {number}  r       The red color value
     * @param   {number}  g       The green color value
     * @param   {number}  b       The blue color value
     * @return  {Array}           The HSL representation
     */
    static rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    static isLegible(hexColor, theme) {
        console.log("Is", hexColor, "legible on theme", theme);

        let currentTheme = theme.themes[theme.isDark ? 'dark' : 'light'];
        let background = currentTheme.navBackground;
        let foreground = currentTheme.foreground;

        let contrastOnBg = Utils.hexContrast(hexColor, background);
        let contrastOnFg = Utils.hexContrast(hexColor, foreground);
        console.log({contrastOnBg, contrastOnFg});
        return {bgLegible: contrastOnBg > 3, fgLegible: contrastOnFg > 2};
    }

    static hexToRgb(hex) {
        if (hex[0] === '#')
            hex = hex.slice(1);
        let r = hex.slice(0, 2);
        let g = hex.slice(2, 4);
        let b = hex.slice(4, 6);
        return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    }

    static hexContrast(hex1, hex2) {
        return Utils.contrast(Utils.hexToRgb(hex1), Utils.hexToRgb(hex2));
    }

    static luminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    static contrast(rgb1, rgb2) {
        const lum1 = Utils.luminance(rgb1[0], rgb1[1], rgb1[2]);
        const lum2 = Utils.luminance(rgb2[0], rgb2[1], rgb2[2]);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    static secondsToHms(seconds) {
        if (isNaN(seconds) || seconds === undefined)
            return '0:00';

        seconds = Math.round(seconds);
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = seconds % 60;
        h = h.toString();
        m = m.toString();
        s = s.toString();
        if (h !== '0') {
            m = m.padStart(2, '0');
            s = s.padStart(2, '0');
        }
        s = s.padStart(2, '0');

        if (h === '0')
            return `${m}:${s}`;
        else return `${h}:${m}:${s}`;
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static bytesToReadable(bytes) {
        let length = Math.log10(bytes);
        if (length < 2) {
            return bytes + ' B';
        } else if (length < 5) {
            return (bytes / 1024).toFixed(2) + ' kB';
        } else if (length < 8) {
            return (bytes / (1024 ** 2)).toFixed(2) + ' MB';
        } else if (length < 12) {
            return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
        } else if (length < 15) {
            return (bytes / (1024 ** 4)).toFixed(2) + ' TB';
        }
        return 'very bige bytes';
    }
}