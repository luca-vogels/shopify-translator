import lupLang from "lup-language";

export function getDefaultLanguage(): string {
    return lupLang.DEFAULT_LANGUAGE;
}

export function isDevMode(){
    return process.env.NODE_ENV !== 'production' && !process.argv.includes("--production");
}

export default {
    getDefaultLanguage,
    isDevMode
}