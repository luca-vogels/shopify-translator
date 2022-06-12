import styles from "../styles/Index.module.css";
import Layout from "../components/Layout";
import Metadata from "../components/Metadata";
import { getLanguageNames, getTranslations } from "lup-language";
import CSV from "../services/CSV.service";
import Upload from "../services/Upload.service";
import TextArea from "../components/TextArea";
import { useEffect, useRef, useState } from "react";
import InputFile from "../components/InputFile";

const AI_SUPPORT = false; // TODO

// TODO Store translation only if different to default

// TODO Change locale of translation

// TODO Store current changes in local storage

// TODO Button to hide all empty fields


export default function Home({LANGUAGE_NAMES, TEXT, fileName, fileContent, errorKey}){
    const [csvState, setCsvState] = useState({});
    const [targetLang, setTargetLang] = useState("EN");

    errorKey = (errorKey && csvState.progress === undefined) ? <b className={styles.error}>{TEXT[errorKey]}</b> : null;
    
    useEffect(() => {

        // load from local storage
        if(csvState.progress === undefined && fileName && localStorage && localStorage.getItem("fileName") === fileName){
            try {
                setCsvState({
                    lines: JSON.parse(localStorage.getItem("lines")),
                    progress: 1.0
                });
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
    
            let currentTitle = null, currentArr = [];
    
            function pushComponent(c){
                if(currentArr.length === 0) return;
                lineElements.push(
                    <div key={c}>
                        {currentTitle}
                        {currentArr}
                    </div>
                );
                currentArr = [];
            }
    
            // iterate all lines except first one if header found
            for(let c=foundHeader; c < csvState.lines.length; c++){
                const column = csvState.lines[c]; while(column.length < minCols) column.push("");
                const title = <h3>{column[typeIdx]} <small>({column[idIdx]})</small></h3>;
                if(title !== currentTitle) pushComponent(c);
                currentTitle = title;
    
                currentArr.push(
                    <div key={c}>
                        <b>{column[fieldIdx]}</b>
                        <div>
                            <TextArea TEXT={TEXT} title={TEXT['Default']} butReset={true} butEdit={true} disabled onBlur={(event) => {
                                csvState.lines[c][defaultIdx] = event.target.value;
                                if(localStorage) localStorage.setItem("lines", JSON.stringify(csvState.lines));
                            }}>
                                {column[defaultIdx]}
                            </TextArea>
                            <TextArea TEXT={TEXT} title={TEXT['Translation']} defaultValue={column[defaultIdx]} butReset={true} butAI={AI_SUPPORT}>
                                {column[translatedIdx]}
                            </TextArea>
                        </div>
                    </div>
                );
            }
            pushComponent(csvState.lines.length);
    
            setCsvState({ progress: csvState.progress, lineElements });
            if(localStorage){
                localStorage.setItem("fileName", fileName);
                localStorage.setItem("lines", JSON.stringify(csvState.lines));
            }
        }
    });


    // Controlls
    const controlls = csvState.lineElements ? (

        // Settings
        <>
            <h2>{TEXT['Settings']}</h2>
            {errorKey}
            <label>
                {TEXT['TargetLanguage']}
                <input type="text" size="1" value={targetLang} onChange={(event) => {
                    setTargetLang(event.target.value.substring(0, 2).toUpperCase());
                }} />
            </label>
        </>

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
            <button type="submit" style={{opacity: "0.0"}}>{TEXT['Upload']}</button>
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
        'CouldNotParseCSV', 'Default', 'pageDescriptionHome', 'pageKeywordsHome', 'pageLongTitleHome', 'ProcessingFile',
        'ReuploadFile', 'Settings', 'TargetLanguage', 'Translation', 'Upload', 'UploadYourShopifyCSV'
    ].forEach((value) => translationKeys.add(value));

    [ // used components
        InputFile, Layout, Metadata, TextArea
    ].forEach((component) => component.addTranslationKeys(translationKeys));
    

    const fileName = (context.query && context.query.args && context.query.args.length > 0) ? context.query.args.join("/") : null;
    let fileContent = null, errorKey = null;
    if(fileName){
        try {
            fileContent = await Upload.readFile(fileName);
            if(!fileContent) errorKey = "ReuploadFile";
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
            fileName,
            fileContent,
            errorKey
        }
    } 
}
