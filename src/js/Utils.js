export default class Utils {
    static isTouchDevice() {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
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