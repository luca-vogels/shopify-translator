import Layout from "../components/Layout";
import Metadata from "../components/Metadata";
import { getLanguageNames, getTranslations } from "lup-language";
import CSV from "../services/CSV.service";
import Upload from "../services/Upload.service";

export default function Home({LANGUAGE_NAMES, TEXT, lines, errorKey}){
    errorKey = errorKey ? <b>{TEXT[errorKey]}</b> : null;

    const fileSelector = lines ? null : (
        <div>
            <input type="file" name="file" required />
            <button type="submit">{TEXT['Upload']}</button>
        </div>
    );

    const lineElements = [];
    if(lines)
        for(let c=0; c < lines.length; c++){
            const column = lines[c];
            lineElements.push(
                <div key={c}>
                    {column[0]}
                </div>
            );
        }

    return (
        <>
            <Metadata LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT} title={TEXT['NAME']} description={TEXT['pageDescriptionIndex']} 
                keywords={TEXT['pageKeywordsIndex']} longTitle={TEXT['pageLongTitleIndex']} allowIndex={true}></Metadata>
            <Layout LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT}>
                <form method="POST" action="/upload" encType="multipart/form-data">
                    {errorKey}
                    <br /><br />
                    {fileSelector}
                </form>

                {lineElements}

            </Layout>
        </>
    )
}


export async function getServerSideProps(context){
    const {res} = context;
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=86400'
    );

    const translationKeys = new Set();
    [ // used translation keys
        'CouldNotParseCSV', 'pageDescriptionHome', 'pageKeywordsHome', 'pageLongTitleHome', 'ReuploadFile', 'Upload'
    ].forEach((value) => translationKeys.add(value));

    [ // used components
        Layout, Metadata
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