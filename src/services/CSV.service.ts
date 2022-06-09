import Upload from "./Upload.service";

const parseCSV = function(content: string): string[][] {
    const lines: string[][] = [];
    let currentCols: string[] = [];
    let current = "";
    let append = false;

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
    }

    return lines;
}


/**
 * 
 * @param fileName 
 * @returns Lines with columns or null if file does not exist
 */
const parseCSVFile = async function(fileName: string): Promise<string[][] | null> {
    return Upload.readFile(fileName).then((content) => content ? parseCSV(content) : null);
}



export default {
    parseCSV,
    parseCSVFile
}