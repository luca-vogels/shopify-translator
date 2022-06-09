const parseCSV = function(content: string): string[][]{
    const lines: string[][] = [];
    const currentCols: string[] = [];
    let start=0, end=0, idx1, idx2, idx3, append=false;
    do {
        idx1 = content.indexOf(',', start);
        idx2 = content.indexOf('"', start);
        idx3 = content.indexOf('\n', start);
        end = Math.min(idx1 < 0 ? content.length : idx1, 
                        idx2 < 0 ? content.length : idx2,
                        idx3 < 0 ? content.length : idx3);
        
    } while(end < content.length);
    return lines;
}

export default {
    parseCSV
}