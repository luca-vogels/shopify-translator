import styles from "../styles/Index.module.css";
import Layout from "../components/Layout";
import Metadata from "../components/Metadata";
import { getLanguageNames, getTranslations } from "lup-language";
import CSV from "../services/CSV.service";
import Upload from "../services/Upload.service";
import TextArea from "../components/TextArea";
import { useEffect, useRef, useState } from "react";
import InputFile from "../components/InputFile";
import Button from "../components/Button";

const AI_SUPPORT = false; // TODO

// TODO Store translation only if different to default

// TODO Change locale of translation

// TODO Store current changes in local storage

// TODO Button to hide all empty fields


export default function Home({LANGUAGE_NAMES, TEXT, originalFileName, fileName, fileContent, errorKey}){
    const refDownload = useRef(null);
    const [csvState, setCsvState] = useState({});
    const [hideAlready, setHideAlready] = useState(false);
    const [hideEmpty, setHideEmpty] = useState(false);
    const [prefillTranslation, setPrefillTranslation] = useState(true);
    const [targetLang, setTargetLang] = useState("");
    const [newFileName, setNewFileName] = useState(originalFileName || fileName);
    const [deleteTranslations, setDeleteTranslations] = useState(false);

    const [resumeButton, setResumeButton] = useState(null);

    errorKey = (errorKey && csvState.progress === undefined) ? <b className={styles.error}>{TEXT[errorKey]}</b> : null;
    

    // Updates the list of editable entries
    const updateLineElements = function(updateLocalStorage=false){
        const lineElements = [];
        let typeIdx = 0, idIdx = 1, fieldIdx = 2, localeIdx = 3, statusIdx = 5, defaultIdx = 6, translatedIdx = 7, foundHeader=0;

        // reading header
        for(let i=0; i < csvState.lines[0].length; i++){
            const col = csvState.lines[0][i].trim().toLowerCase();
            if(col === "type"){ typeIdx = i; foundHeader = 1; } else 
            if(col.startsWith("id")){ idIdx = i; } else 
            if(col.startsWith("field")){ fieldIdx = i; foundHeader = 1; } else
            if(col.startsWith("locacle")){ localeIdx = i; foundHeader = 1; } else
            if(col.startsWith("status")){ statusIdx = i; foundHeader = 1; } else 
            if(col.indexOf("content") >= 0){
                if(col.indexOf("translate") >= 0) translatedIdx = i; else defaultIdx = i;
                foundHeader = 1;
            } 
        }

        const minCols = Math.max(typeIdx, idIdx, fieldIdx, localeIdx, statusIdx, defaultIdx, translatedIdx)+1;

        let currentTitleKey = null, currentTitle = null, currentArr = [];

        // builds title block with multiple field blocks
        function pushComponent(c){
            if(currentArr.length === 0) return;
            const allHidden = currentArr.reduce((bool, ele) => bool && ele.props.hidden, true);
            lineElements.push(
                <div key={c} style={allHidden ? {display: "none"} : {}}>
                    {currentTitle}
                    {currentArr}
                </div>
            );
            currentArr = [];
        }

        // detect target language
        if(targetLang.length === 0){
            const column = csvState.lines[foundHeader];
            if(localeIdx < column.length && column[localeIdx].length > 0) setTargetLang(column[localeIdx].toUpperCase());
        }

        // iterate all lines except first one if header found
        for(let c=foundHeader; c < csvState.lines.length; c++){
            const column = csvState.lines[c]; while(column.length < minCols) column.push("");
            if(deleteTranslations) column[translatedIdx] = "";

            const titleKey = column[typeIdx]+"-"+column[idIdx];
            if(titleKey !== currentTitleKey){ pushComponent(c); }
            currentTitleKey = titleKey;
            currentTitle = <h3>{column[typeIdx]} <small>({column[idIdx]})</small></h3>;

            // add field block to current title block
            const transEmpty = !column[translatedIdx] || column[translatedIdx].length === 0;
            const hidden = (hideEmpty && transEmpty && (!column[defaultIdx] || column[defaultIdx].length === 0)) ||
                            (hideAlready && !transEmpty);
            currentArr.push(
                <div key={c} hidden={hidden} style={hidden ? {display: "none"} : {}}>
                    <b>{column[fieldIdx]}</b>
                    <div>
                        <TextArea TEXT={TEXT} title={TEXT['Default']} butReset={true} butEdit={true} disabled onBlur={(event) => {
                            csvState.lines[c][defaultIdx] = event.target.value;
                            if(localStorage) localStorage.setItem("lines", JSON.stringify(csvState.lines));
                            if(hideEmpty && !event.isButtonPressed) updateLineElements();
                        }}>
                            {column[defaultIdx]}
                        </TextArea>
                        <TextArea TEXT={TEXT} title={TEXT['Translation']} defaultValue={(deleteTranslations || !prefillTranslation) ? "" : column[defaultIdx]} 
                            butReset={true} butAI={AI_SUPPORT} 
                            onBlur={(event) => {
                                csvState.lines[c][translatedIdx] = event.target.value;
                                if(localStorage) localStorage.setItem("lines", JSON.stringify(csvState.lines));
                                if(hideAlready && !event.isButtonPressed) updateLineElements();
                        }}>
                            {column[translatedIdx]}
                        </TextArea>
                    </div>
                </div>
            );
        }
        pushComponent(csvState.lines.length);

        setCsvState({
            progress: csvState.progress,
            header: {
                found: foundHeader === 1 ? true : false,
                localeIdx
            },
            lines: csvState.lines,
            lineElements, 
        });
        setDeleteTranslations(false);

        if(updateLocalStorage && localStorage){
            if(fileName) localStorage.setItem("fileName", fileName);
            if(originalFileName) localStorage.setItem("originalFileName", originalFileName);
            if(csvState.lines) localStorage.setItem("lines", JSON.stringify(csvState.lines));
        }
    }



    // Process CSV
    useEffect(() => {
        // upload form resume button
        if(localStorage && localStorage.getItem("fileName")) setResumeButton(<>
            <br />
            <small>
                <hr style={{display: "inline-block", width: "30px", margin: "0.2em"}} />
                <b>{TEXT['or']}</b>
                <hr style={{display: "inline-block", width: "30px", margin: "0.2em"}} />
            </small>
            <br />
            <br />
            <a href={localStorage.getItem("fileName")} style={{color: "inherit"}}>{TEXT['ResumeWorking']}</a>
        </>);

        // load from local storage
        if(csvState.progress === undefined && fileName && localStorage && localStorage.getItem("fileName") === fileName){
            try {
                setCsvState({
                    lines: JSON.parse(localStorage.getItem("lines")),
                    progress: 1.0
                });
                originalFileName = localStorage.getItem("originalFileName") || fileName;
                setNewFileName(originalFileName);
                fileContent = undefined;
                errorKey = null;
            } catch (ex){}
        }


        // process CSV file
        if(fileContent && csvState.progress === undefined) CSV.parseCSV(fileContent, (progress, lines) => {
            setCsvState({progress, lines});
        }, 10);


        // render lines
        if(csvState.lines && csvState.lineElements === undefined){
            updateLineElements(true);
        }
    });


    // Builds new CSV file and downloads it
    const buildFileAndDownload = function(){
        refDownload.current.setLoading(true);
        setTimeout(() => {

            let content = "";
            if(csvState.lines){
                const foundHeader = csvState.header.found ? 1 : 0;
                const localeIdx = csvState.header.localeIdx;
                const tl = targetLang.toLowerCase();

                // append header as read
                if(foundHeader) content += csvState.lines[0].join(",")+"\n";

                // iterate data rows
                for(let i=foundHeader; i < csvState.lines.length; i++){
                    const column = csvState.lines[i];
                    if(!column) continue;

                    for(let j=0; j < column.length; j++){
                        if(j === localeIdx){ content += (j===0 ? '' : ',')+tl; continue; }
                        const col = column[j];
                        const useQuotes = (col.indexOf('"') >= 0 || col.indexOf("\n") >= 0 || col.indexOf(",") >= 0);
                        content += (j===0 ? '' : ',') + (useQuotes ? '"'+col.replaceAll('"', '""')+'"' : col);
                    }

                    content += "\n";
                }
            }
            
            // Create file
            const doc = document.createElement("a");
            doc.style.display = "none";
            doc.setAttribute("download", newFileName);
            doc.setAttribute("href", "data:text/csv;charset=utf-8,"+encodeURIComponent(content));
            document.body.appendChild(doc);
            doc.click();
            document.body.removeChild(doc);

            refDownload.current.setLoading(false);

        }, 0);
    }


    // Controlls
    const controlls = csvState.lineElements ? (

        // Settings
        <div className={styles.settings}>
            <h2>{TEXT['Settings']}</h2>
            {errorKey}
            <label style={{cursor: "pointer"}}>
                <input type="checkbox" onChange={() => {
                    const next = !hideAlready; setHideAlready(next); hideAlready=next; updateLineElements(); 
                } } checked={hideAlready} />
                <span>{TEXT['HideAlreadyTranslatedFields']}</span>
            </label>
            <label style={{cursor: "pointer"}}>
                <input type="checkbox" onChange={() => { 
                    const next = !hideEmpty; setHideEmpty(next); hideEmpty=next; updateLineElements();
                 }} checked={hideEmpty} />
                <span>{TEXT['HideFieldsWithEmptyDefault']}</span>
            </label>
            <label style={{cursor: "pointer"}}>
                <input type="checkbox" onChange={() => { 
                    const next = !prefillTranslation; setPrefillTranslation(next); prefillTranslation=next; updateLineElements();
                 }} checked={prefillTranslation} />
                <span>{TEXT['PrefillTranslationWithDefault']}</span>
            </label>
            <br />
            <small><label>
                <span>{TEXT['DeleteAllTranslations']}</span>
                <Button type="button" disabled={deleteTranslations} onClick={() => {
                    setDeleteTranslations(true);
                    deleteTranslations = true;
                    updateLineElements(true);
                }}>{TEXT['Delete']}</Button>
            </label></small>
            <br />
            <label>
                <span>{TEXT['TargetLanguage']}:</span>
                <datalist id="language-codes">{
                    [   
                        'ab','aa','af','ak','sq','am','ar','an','hy','as','av','ae','ay','az','bm','ba','eu',
                        'be','bn','bh','bi','bs','br','bg','my','ca','ch','ce','ny','zh','zh-Hans','zh-Hant',
                        'cv','kw','co','cr','hr','cs','da','dv','nl','dz','en','eo','et','ee','fo','fj','fi',
                        'fr','ff','gl','gd','gv','ka','de','el','kl','gn','gu','ht','ha','he','hz','hi','ho',
                        'hu','is','io','ig','id','in','ia','ie','iu','ik','ga','it','ja','jv','kn','kr','ks',
                        'kk','km','ki','rw','rn','ky','kv','kg','ko','ku','kj','lo','la','lv','li','ln','lt',
                        'lu','lg','lb','mk','mg','ms','ml','mt','mi','mr','mh','mo','mn','na','nv','ng','nd',
                        'ne','no','nb','nn','ii','oc','oj','cu','or','om','os','pi','ps','fa','pl','pt','pa',
                        'qu','rm','ro','ru','se','sm','sg','sa','sr','sh','st','tn','sn','sd','si','ss','sk',
                        'sl','so','nr','es','su','sw','sv','tl','ty','tg','ta','tt','te','th','bo','ti','to',
                        'ts','tr','tk','tw','ug','uk','ur','uz','ve','vi','vo','wa','cy','wo','fy','xh','yi',
                        'ji','yo','za','zu'
                    ].sort().map((str) => <option key={str} value={str.toUpperCase()}></option>)
                }</datalist>
                <input type="text" size="1" list="language-codes" value={targetLang} required onChange={(event) => {
                    setTargetLang(event.target.value.substring(0, 7).toUpperCase());
                }} />
            </label>
            <label>
                <span>{TEXT['FileName']}:</span>
                <input type="text" value={newFileName} required onChange={(event) => {
                    setNewFileName(event.target.value);
                }} />
            </label>
            <Button ref={refDownload} type="button" onClick={buildFileAndDownload}>{TEXT['Download']}</Button>
        </div>

    ) : ( csvState.progress !== undefined ? (

        // Progress bar
        <>
            <b>{TEXT['ProcessingFile']}</b>
            <progress value={Math.floor(csvState.progress * 100)} max={100}>{Math.floor(csvState.progress * 100)}%</progress>
        </>

    ) : (

        // Upload form
        <form method="POST" action="/upload" encType="multipart/form-data">
            {errorKey}
            <h2>{TEXT['UploadYourShopifyCSV']}</h2>
            <InputFile TEXT={TEXT} name="file" required={true} onChange={(event) => event.target.form.submit() } />
            <Button type="submit" style={{opacity: "0.0"}}>{TEXT['Upload']}</Button>
            {resumeButton}
        </form>
    ));


    // HTML
    return (
        <>
            <Metadata LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT} title={TEXT['NAME']} description={TEXT['pageDescriptionIndex']} 
                keywords={TEXT['pageKeywordsIndex']} longTitle={TEXT['pageLongTitleIndex']} allowIndex={true}></Metadata>
            <Layout LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT}>

                <div className={styles.controlls}>
                    {controlls}
                </div>

                <div className={styles.list}>
                    {csvState.lineElements}
                </div>

            </Layout>
        </>
    )
}


export async function getServerSideProps(context){
    const {res} = context;
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');


    const translationKeys = new Set();
    [ // used translation keys
        'CouldNotParseCSV', 'Default', 'Delete', 'DeleteAllTranslations', 'Download', 'FileName', 
        'HideAlreadyTranslatedFields', 'HideFieldsWithEmptyDefault', 'or',
        'pageDescriptionHome', 'pageKeywordsHome', 'pageLongTitleHome', 'PrefillTranslationWithDefault',
        'ProcessingFile', 'ResumeWorking', 'ReuploadFile', 'Settings', 
        'TargetLanguage', 'Translation', 'Upload', 'UploadYourShopifyCSV'
    ].forEach((value) => translationKeys.add(value));

    [ // used components
        Button, InputFile, Layout, Metadata, TextArea
    ].forEach((component) => component.addTranslationKeys(translationKeys));
    

    const fileName = (context.query && context.query.args && context.query.args.length > 0) ? context.query.args.join("/") : null;
    let originalFileName = null, fileContent = null, errorKey = null;
    if(fileName){
        try {
            const info = await Upload.readFile(fileName);
            if(!info) errorKey = "ReuploadFile";
            else { originalFileName = info.originalFileName; fileContent = info.content; }
        } catch (ex){
            errorKey = "CouldNotParseCSV";
            Upload.deleteFile(fileName);
        }
    }

    const TEXT = await getTranslations(context.locale, context.defaultLocale, translationKeys);
    return {
        props: {
            LANGUAGE_NAMES: await getLanguageNames(),
            TEXT,
            originalFileName,
            fileName,
            fileContent,
            errorKey
        }
    } 
}
