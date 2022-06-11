import Upload from "./Upload.service";

const parseCSV = function(content: string, callback: (progress: number, lines: string[][] | null) => void, steps=100): void {
    const lines: string[][] = [];
    let currentCols: string[] = [];
    let current = "";
    let append = false;

    callback(0.0, null);
    let lastCallback = 0;

    for(let i=0; i < content.length; i++){
        const c = content[i];
        switch(c){

            case ',':
                if(append){
                    current += c;
                } else {
                    currentCols.push(current);
                    current = "";
                }
                break;

            case '"':
                if(append){
                    if(i+1 < content.length && content[i+1] === c){
                        current += c; i++;
                    } else {
                        append = false;
                    }
                } else {
                    append = true;
                }
                break;
            
            case "\n":
                if(append) current += c; else {
                    currentCols.push(current);
                    lines.push(currentCols);
                    currentCols = [];
                    current = "";
                }
                break;
            
            default: current += c;
        }

        let nextCallback = Math.floor(i * steps / content.length);
        if(steps > 0 && nextCallback > lastCallback){
            lastCallback = nextCallback;
            callback(i / content.length, null);
        }
    }

    callback(1.0, lines);
}


export default {
    parseCSV,
}