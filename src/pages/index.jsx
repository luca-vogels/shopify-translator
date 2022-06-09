import Layout from "../components/Layout";
import Metadata from "../components/Metadata";
import { getLanguageNames, getTranslations } from "lup-language";

export default function Home({LANGUAGE_NAMES, TEXT}){
    return (
        <>
            <Metadata LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT} title={TEXT['NAME']} description={TEXT['pageDescriptionIndex']} 
                keywords={TEXT['pageKeywordsIndex']} longTitle={TEXT['pageLongTitleIndex']} allowIndex={true}></Metadata>
            <Layout LANGUAGE_NAMES={LANGUAGE_NAMES} TEXT={TEXT}>
                
            </Layout>
        </>
    )
}


export async function getStaticProps(context){
    const translationKeys = new Set();
    [ // used translation keys
        'pageDescriptionHome', 'pageKeywordsHome', 'pageLongTitleHome'
    ].forEach((value) => translationKeys.add(value));

    [ // used components
        Layout, Metadata
    ].forEach((component) => component.addTranslationKeys(translationKeys));
    
    const TEXT = await getTranslations(context.locale, context.defaultLocale, translationKeys);
    return {
        props: {
            LANGUAGE_NAMES: await getLanguageNames(),
            TEXT: TEXT
        }
    } 
}