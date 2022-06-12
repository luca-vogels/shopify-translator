import fs from "fs";
import path from "path";
import multer from "multer";


const PATH = "./uploads";

const DIRECTORY = path.resolve(PATH);
const MAX_FILE_SIZE = 500 * 1000 * 1000; // 500 MB
const MAX_STORAGE = 5 * 1000 * 1000 * 1000; // --> max 5GB storage
const MAX_FILE_AGE = 3 * 86400 * 1000; // 3 days

const MULTER_SETTINGS: multer.Options = {
    dest: PATH,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
};


export async function handleFiles(file: any[] | any): Promise<void>{
    return new Promise(async (resolve) => {
        if(!file){ resolve(); null; }
        const files = (file instanceof Array) ? file : [file];

        await freeStorage();

        let remaining = files.length;

        // write original file name into top of files
        for(let f of files){
            if(!f) continue;
            const p = path.resolve(PATH, f.filename);
            fs.readFile(p, { flag: "r+" }, (errR: any, content: Buffer) => {
                if(errR) console.error(errR);
                fs.writeFile(p, f.originalname+"\n"+content.toString(), {}, (errW) => {
                    if(errW) console.error(errW);
                    if(--remaining === 0) resolve();
                });
            });
        }
    });
}


export async function freeStorage(): Promise<void>{
    return new Promise((resolve) => {
        fs.readdir(DIRECTORY.toString(), {}, (err: any, files: any) => {
            if(!files || files.length === 0){ resolve(); return; }
            const now = new Date().getTime();

            let currentStorage = 0;
            let allFiles: {[key: number]: {filename: string, stats: fs.Stats}} = {};

            let remaining = files.length;
            for(const f of files){
                const p = path.resolve(DIRECTORY, f);
                fs.stat(p, {}, (err: any, stats: fs.Stats) => {
                    if(stats && stats.isFile()){
                        if(now - stats.birthtimeMs < MAX_FILE_AGE){
                            allFiles[stats.birthtimeMs] = { filename: f, stats };
                            currentStorage += stats.size;
                        } else fs.unlink(p, () => {});
                    } else if(stats && stats.isDirectory())
                        fs.rm(p, {recursive: true}, () => {});
                    
                    // all file information collected, delete oldest ones if necessary
                    if(--remaining === 0){
                        const orderedFiles: {filename: string, stats: fs.Stats}[] = Object.keys(allFiles).sort().reduce((list: any, key: any) => { list.push(allFiles[key]); return list; }, []);
                        while(currentStorage > MAX_STORAGE){
                            const deleteFile = orderedFiles.pop();
                            if(!deleteFile) continue;
                            currentStorage -= deleteFile.stats.size;
                            fs.unlink(path.resolve(DIRECTORY, deleteFile.filename), (err) => {});
                        }
                        resolve();
                    }
                });
            }

        });
    });
}



export function deleteFile(fileName: string){
    fs.unlink(path.resolve(DIRECTORY, fileName), (err) => { if(err) console.error(err); });
}


/**
 * 
 * @param fileName 
 * @returns File info with content of file or null if file does not exist
 */
export async function readFile(fileName: string): Promise<{originalFileName: string, content: string} | null> {
    return new Promise((resolve) => {
        fs.readFile(path.resolve(DIRECTORY, fileName), {}, (err, content) => {
            if(content){
                const str = content.toString();
                const idx = str.indexOf("\n");
                resolve({
                    originalFileName: idx < 0 ? fileName : str.substring(0, idx),
                    content: str.substring(idx+1)
                });
            } else resolve(null);
        });
    });
}

export default {
    MULTER_SETTINGS,
    handleFiles,
    freeStorage,
    deleteFile,
    readFile
}