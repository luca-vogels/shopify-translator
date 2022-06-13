import styles from "../styles/Index.module.css";
import Layout from "../components/Layout";
import Metadata from "../components/Metadata";
import { getLanguageNames, getTranslations } from "lup-language";
import CSV from "../services/CSV.service";
import Upload from "../services/Upload.service";
import TextArea from "../components/TextArea";
import React, { useEffect, useRef, useState } from "react";
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
    const [filters, setFilters] = useState({ hideAlready: false, hideEmpty: false });
    const [prefillTranslation, setPrefillTranslation] = useState(true);
    const [targetLang, setTargetLang] = useState("");
    const [newFileName, setNewFileName] = useState(originalFileName || fileName);

    const [resumeButton, setResumeButton] = useState(null);

    errorKey = (errorKey && csvState.progress === undefined) ? <b className={styles.error}>{TEXT[errorKey]}</b> : null;

    // Process CSV
    useEffect(() => {
        // upload form resume button
        if(localStorage && localStorage.getItem("fileName") && !resumeButton) setResumeButton(<>
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
        if(fileContent && csvState.progress === undefined){
            CSV.parseCSV(fileContent, (progress, lines) => {
                setCsvState({progress, lines});
            }, 10);
        }


        // create HTML for CSV content
        if(csvState.lines && csvState.lineElements === undefined){
            const lineElements = [];
            const refs = []; // [ {containerRef: any, subContainerRefs: ref[], defaultRefs: ref[], translationRefs: ref[]} ]
            let typeIdx = 0, idIdx = 1, fieldIdx = 2, localeIdx = 3, statusIdx = 5, defaultIdx = 6, translationIdx = 7, foundHeader=0;

            // reading header and detect indices
            for(let i=0; i < csvState.lines[0].length; i++){
                const col = csvState.lines[0][i].trim().toLowerCase();
                if(col === "type"){ typeIdx = i; foundHeader = 1; } else 
                if(col.startsWith("id")){ idIdx = i; } else 
                if(col.startsWith("field")){ fieldIdx = i; foundHeader = 1; } else
                if(col.startsWith("locacle")){ localeIdx = i; foundHeader = 1; } else
                if(col.startsWith("status")){ statusIdx = i; foundHeader = 1; } else 
                if(col.indexOf("content") >= 0){
                    if(col.indexOf("translate") >= 0) translationIdx = i; else defaultIdx = i;
                    foundHeader = 1;
                } 
            }

            const minCols = Math.max(typeIdx, idIdx, fieldIdx, localeIdx, statusIdx, defaultIdx, translationIdx)+1;

            // detect target language
            if(targetLang.length === 0){
                const column = csvState.lines[foundHeader];
                if(localeIdx < column.length && column[localeIdx].length > 0) setTargetLang(column[localeIdx].toUpperCase());
            }

            let currentTitleKey = null, currentTitle = null, currentArr = [];
            let subContainerRefs = [], defaultRefs = [], translationRefs = [];

            // builds title block with multiple field blocks
            function pushComponent(c){
                if(currentArr.length === 0) return;
                const containerRef = React.createRef();
                lineElements.push(
                    <div key={c} ref={containerRef}>
                        {currentTitle}
                        {currentArr}
                    </div>
                );
                refs.push({
                    containerRef,
                    subContainerRefs,
                    defaultRefs,
                    translationRefs
                });
                currentArr = [];
                subContainerRefs = [];
                defaultRefs = [];
                translationRefs = [];
            }

            // iterate all lines except first one if header found
            for(let c=foundHeader; c < csvState.lines.length; c++){
                const column = csvState.lines[c]; while(column.length < minCols) column.push("");

                const titleKey = column[typeIdx]+"-"+column[idIdx];
                if(titleKey !== currentTitleKey){ pushComponent(c); }
                currentTitleKey = titleKey;
                currentTitle = <h3>{column[typeIdx]} <small>({column[idIdx]})</small></h3>;

                // add field block to current title block
                const refSubContainer = React.createRef();
                const refDefault = React.createRef();
                const refTranslation = React.createRef();
                currentArr.push(
                    <div ref={refSubContainer} key={c}>
                        <b>{column[fieldIdx]}</b>
                        <div>

                            <TextArea ref={refDefault} TEXT={TEXT} title={TEXT['Default']} butReset={true} butEdit={true} disabled onBlur={(event) => {
                                csvState.lines[c][defaultIdx] = event.target.value;
                                if(localStorage) localStorage.setItem("lines", JSON.stringify(csvState.lines));
                                if(filters.hideEmpty) filtersChanged();
                            }}>{column[defaultIdx]}</TextArea>

                            <TextArea ref={refTranslation} TEXT={TEXT} title={TEXT['Translation']} butReset={true} butAI={AI_SUPPORT} 
                                initialValue={prefillTranslation ? "" : column[defaultIdx]}
                            onBlur={(event) => {
                                csvState.lines[c][translationIdx] = event.target.value;
                                if(localStorage) localStorage.setItem("lines", JSON.stringify(csvState.lines));
                                if(filters.hideAlready) filtersChanged();
                            }}>{column[translationIdx] || (prefillTranslation ? column[defaultIdx] : "")}</TextArea>

                        </div>
                    </div>
                );
                subContainerRefs.push(refSubContainer);
                defaultRefs.push(refDefault);
                translationRefs.push(refTranslation);
            }
            pushComponent(csvState.lines.length);

            
            const newCsvState = {
                progress: csvState.progress,
                header: {
                    found: foundHeader === 1 ? true : false,
                    localeIdx,
                    translationIdx
                },
                lines: csvState.lines,
                lineElements,
                refs
            };
            setCsvState(newCsvState);
            for(let k in newCsvState) csvState[k] = newCsvState[k];

            if(localStorage){
                if(fileName) localStorage.setItem("fileName", fileName);
                if(originalFileName) localStorage.setItem("originalFileName", originalFileName);
                if(csvState.lines) localStorage.setItem("lines", JSON.stringify(csvState.lines));
            }
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


    const filtersChanged = function(){
        if(!csvState.refs) return;
        let first = true;
        for(let {containerRef, subContainerRefs, defaultRefs, translationRefs} of csvState.refs){
            let hiddenCount = 0;
            for(let i=0; i < defaultRefs.length; i++){
                const subContainer = subContainerRefs[i];
                const defaultComp = defaultRefs[i];
                const translationComp = translationRefs[i];
                const hide = (
                    (filters.hideAlready && translationComp && translationComp.current && translationComp.current.gotChanged()) ||
                    (filters.hideEmpty && defaultComp && defaultComp.current && !defaultComp.current.getValue())
                );
                if(subContainer && subContainer.current)
                    subContainer.current.style.display = hide ? "none" : null;
                hiddenCount += hide ? 1 : 0;
                if(first){
                    first = false;
                }
            }
            if(containerRef && containerRef.current)
                containerRef.current.style.display = hiddenCount === defaultRefs.length ? "none" : null;
        }
    }


    // Controlls
    const controlls = csvState.lineElements ? (

        // Settings
        <div className={styles.settings}>
            <h2>{TEXT['Settings']}</h2>
            {errorKey}
            <label style={{cursor: "pointer"}}>
                <input type="checkbox" onChange={() => {
                    const newFilters = {...filters, hideAlready: !filters.hideAlready};
                    setFilters(newFilters);
                    filters.hideAlready = newFilters.hideAlready;
                    filtersChanged();
                }} checked={filters.hideAlready} />
                <span>{TEXT['HideAlreadyTranslatedFields']}</span>
            </label>
            <label style={{cursor: "pointer"}}>
                <input type="checkbox" onChange={() => {
                    const newFilters = {...filters, hideEmpty: !filters.hideEmpty};
                    setFilters(newFilters);
                    filters.hideEmpty = newFilters.hideEmpty;
                    filtersChanged();
                 }} checked={filters.hideEmpty} />
                <span>{TEXT['HideFieldsWithEmptyDefault']}</span>
            </label>
            <label style={{cursor: "pointer"}}>
                <input type="checkbox" onChange={() => {
                    const prefill = !prefillTranslation;
                    setPrefillTranslation(prefill);
                    if(csvState.refs){
                        if(prefill){
                            for(const {defaultRefs, translationRefs} of csvState.refs)
                                for(let i=0; i < translationRefs.length; i++){
                                    const translationComp = translationRefs[i];
                                    const defaultComp = defaultRefs[i];
                                    if(!translationComp || !translationComp.current || !defaultComp || !defaultComp.current) continue;
                                    if(!translationComp.current.getValue())
                                        translationComp.current.set(defaultComp.current.getValue(), "");
                                }
                        } else {
                            for(const {defaultRefs, translationRefs} of csvState.refs)
                                for(let i=0; i < translationRefs.length; i++){
                                    const translationComp = translationRefs[i];
                                    const defaultComp = defaultRefs[i];
                                    if(!translationComp || !translationComp.current || !defaultComp || !defaultComp.current) continue;
                                    if(translationComp.current.getValue() && !translationComp.current.gotChanged() && 
                                        translationComp.current.getValue() === defaultComp.current.getValue())
                                            translationComp.current.set("", "");
                                }
                        }
                    }
                    if(filters.hideAlready) filtersChanged();
                 }} checked={prefillTranslation} />
                <span>{TEXT['PrefillTranslationWithDefault']}</span>
            </label>
            <br />
            <small><label>
                <span>{TEXT['DeleteAllTranslations']}</span>
                <Button type="button" onClick={() => {
                    setPrefillTranslation(false);
                    if(csvState.refs)
                        for(let {translationRefs} of csvState.refs)
                            for(let translationRef of translationRefs)
                                if(translationRef && translationRef.current) translationRef.current.set("", "");
                    if(csvState.lines){
                        const fh = csvState.header.foundHeader ? 1 : 0;
                        const translationIdx = csvState.header.translationIdx;
                        for(let i=fh; i < csvState.lines.length; i++){
                            csvState.lines[i][translationIdx] = "";
                        }
                        if(localStorage) localStorage.setItem("lines", JSON.stringify(csvState.lines));
                    }
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
