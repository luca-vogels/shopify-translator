import styles from "../styles/Index.module.css";
import Layout from "../components/Layout";
import Metadata from "../components/Metadata";
import { getLanguageNames, getTranslations } from "lup-language";
import CSV from "../services/CSV.service";
import Upload from "../services/Upload.service";
import TextArea from "../components/TextArea";
import { useRef } from "react";
import InputFile from "../components/InputFile";

const AI_SUPPORT = false; // TODO

// TODO Store translation only if different to default

// TODO Change locale of translation

// TODO Store current changes in local storage

// TODO Button to hide all empty fields


export default function Home({LANGUAGE_NAMES, TEXT, lines, errorKey}){
    const refLanguage = useRef(null);

    errorKey = errorKey ? <b className={styles.error}>{TEXT[errorKey]}</b> : null;

    const lineElements = [];
    if(lines && lines.length > 0){
        let typeIdx = 0, idIdx = 1, fieldIdx = 2, localeIdx = 3, statusIdx = 5, defaultIdx = 6, translatedIdx = 7, foundHeader=0;

        // reading header
        for(let i=0; i < lines[0].length; i++){
            const col = lines[0][i].trim().toLowerCase();
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

        function pushComponent(c, title){
            if(currentArr.length === 0) return;
            lineElements.push(
                <div key={c}>
                    {title}
                    {currentArr}
                </div>
            );
            currentArr = [];
        }

        // iterate all lines except first one if header found
        for(let c=foundHeader; c < lines.length; c++){
            const column = lines[c]; while(column.length < minCols) column.push("");
            const title = column[typeIdx]+" - "+column[idIdx];
            if(title !== currentTitle) pushComponent(c, <h3>{column[typeIdx]} <small>({column[idIdx]})</small></h3>);
            currentTitle = title;

            currentArr.push(
                <div key={c}>
                    <b>{column[fieldIdx]}</b>
                    <div>
                        <TextArea TEXT={TEXT} title={TEXT['Default']} butReset={true} butEdit={true} disabled>
                            {column[defaultIdx]}
                        </TextArea>
                        <TextArea TEXT={TEXT} title={TEXT['Translation']} defaultValue={column[defaultIdx]} butReset={true} butAI={AI_SUPPORT}>
                            {column[translatedIdx]}
                        </TextArea>
                    </div>
                </div>
            );
        }
    }


    const controlls = lines ? (
        <>
            <h2>{TEXT['Settings']}</h2>
            <label>
                {TEXT['TargetLanguage']}
                <input type="text" ref={refLanguage} />
            </label>
        </>
    ) : (
        <form method="POST" action="/upload" encType="multipart/form-data">
            <InputFile TEXT={TEXT} name="file" required={true} onChange={(event) => event.target.form.submit() } />
            <button type="submit" style={{opacity: "0.0"}}>{TEXT['Upload']}</button>
        </form>
    )


    return (
        <>
            <Metadata LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT} title={TEXT['NAME']} description={TEXT['pageDescriptionIndex']} 
                keywords={TEXT['pageKeywordsIndex']} longTitle={TEXT['pageLongTitleIndex']} allowIndex={true}></Metadata>
            <Layout LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT}>

                <div className={styles.controlls}>
                    {errorKey}
                    {controlls}
                </div>

                <div className={styles.list}>
                    {lineElements}
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
        'CouldNotParseCSV', 'Default', 'pageDescriptionHome', 'pageKeywordsHome', 'pageLongTitleHome', 
        'ReuploadFile', 'Settings', 'TargetLanguage', 'Translation', 'Upload'
    ].forEach((value) => translationKeys.add(value));

    [ // used components
        InputFile, Layout, Metadata, TextArea
    ].forEach((component) => component.addTranslationKeys(translationKeys));
    

    const fileName = (context.query && context.query.args && context.query.args.length > 0) ? context.query.args.join("/") : null;
    let lines = null, errorKey = null;
    if(fileName){
        try {
            lines = await CSV.parseCSVFile(fileName);
            if(!lines) errorKey = "ReuploadFile";
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
            lines,
            errorKey
        }
    } 
}

/*
export async function getStaticPaths(){
    return {
        paths: [
            { params: { args: [] } }
        ],
        fallback: "blocking"
    }
}
*/