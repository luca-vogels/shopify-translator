import fs from "fs";
import path from "path";
import multer from "multer";


const PATH = "./uploads";

const DIRECTORY = path.resolve(PATH);
const MAX_FILE_SIZE = 500 * 1000 * 1000; // 500 MB
const MAX_FILES = 50; // --> max 25GB storage needed
const DELETE_SEC = 86400;

const MULTER_SETTINGS: multer.Options = {
    dest: PATH,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
};





let FILES: any[] = [];

export function init(){
    fs.rm(DIRECTORY, { recursive: true }, (err) => {
        if(err) console.error(err);
        fs.mkdir(DIRECTORY, { recursive: true }, (err) => { if(err) console.error(err); });
    });
}


export function handleFiles(file: any[] | any){
    if(!file) return;
    const files = (file instanceof Array) ? file : [file];

    while(FILES.length + files.length > MAX_FILES){
        const delFile = FILES.shift();
        if(delFile) fs.unlink(path.resolve(DIRECTORY, delFile.filename), (err) => { if(err) console.error(err); }); else break;
    }

    for(let f of files) FILES.push(f);

    setTimeout(() => {
        for(let f of files) deleteFile(f.filename);
    }, DELETE_SEC*1000);
}


export function deleteFile(fileName: string){
    fs.unlink(path.resolve(DIRECTORY, fileName), (err) => { if(err) console.error(err); });
    FILES.forEach((file, idx) => {
        if(file.filename === fileName) FILES = FILES.splice(idx, 1);
    });
}


/**
 * 
 * @param fileName 
 * @returns Content of file or null if file does not exist
 */
export async function readFile(fileName: string): Promise<string | null> {
    return new Promise((resolve) => {
        fs.readFile(path.resolve(DIRECTORY, fileName), {}, (err, content) => {
            resolve(content ? content.toString() : null);
        });
    });
}

export default {
    MULTER_SETTINGS,
    init,
    handleFiles,
    deleteFile,
    readFile
}