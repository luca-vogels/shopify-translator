export function getCreationLockDate(): number {
    return new Date().getTime() + (parseInt(process.env.CREATION_LOCK_SEC || "") || 300);
}

export function getViewportSize(): [number, number] {
    return global.window ? [
        global.window.innerWidth,
        global.window.innerHeight
    ] : [0.0, 0.0];
}

export function parseQueryFromPath(path?: string, existingObj?: {[key: string]: string | null} | null): {[key: string]: string | null} {
    const result: {[key: string]: string | null} = existingObj ? existingObj : {};
    if(!path) return result;
    let start = path.indexOf("?");
    if(start < 0) return result;
    path = path.substring(start+1);
    path.split("&").forEach((part) => {
        const idx = part.indexOf("=");
        const key = decodeURIComponent(idx < 0 ? part : part.substring(0, idx));
        if(!result[key]) result[key] = idx < 0 ? null : decodeURIComponent(part.substring(idx+1));
    });
    return result;
}

export function parseQueryFromWindow(existingObj?: {[key: string]: string | null} | null): {[key: string]: string | null} {
    return parseQueryFromPath((global.window && global.window.location) ? global.window.location.search : undefined, existingObj);
}


export function validateEmail(email: string): string | null {
    return email ? email.trim().replace(/ /g, "").toLowerCase() : null;
}

export default {
    getCreationLockDate,
    getViewportSize,
    parseQueryFromPath,
    parseQueryFromWindow,
    validateEmail
}