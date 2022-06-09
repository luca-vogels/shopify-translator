import { useRouter } from "next/router";
import styles from "./LanguageSelector.module.css";
import Link from "next/link";
import Arrow, { ARROW_RIGHT } from "./Arrow";

export default function LanguageSelector({LANGUAGE_NAMES, openUpwards=false}){
    const {locale, asPath} = useRouter();
    let urlPath = asPath.lastIndexOf("#");
    urlPath = urlPath < 0 ? asPath : asPath.substring(0, urlPath);

    let currentLanguage = null;
    let links = [];

    const onClickLanguage = function(event){
        event.target.blur();
        event.target.parentNode.blur();
    }

    for(let l in LANGUAGE_NAMES){
        if(l == locale || !currentLanguage) currentLanguage = l.toUpperCase();
        const key = "language-selector-"+l;
        const href = "/"+l+urlPath;
        links.push(<Link key={key} href={href} locale={l}><a className="noselect nodrag" onClick={onClickLanguage}>{LANGUAGE_NAMES[l]}</a></Link>);
    }
    
    let containerStyle = openUpwards ? {alignItems: "flex-end"} : {}

    return (
        <div className={styles.selector} style={containerStyle} tabIndex="0">
            <span><Arrow className={styles.arrow} rotation={ARROW_RIGHT} />{currentLanguage}</span>
            <div>
                {links}
            </div>
        </div>
    )
}

LanguageSelector.addTranslationKeys = function(set){
    [ // used components
        Arrow
    ].forEach((component) => component.addTranslationKeys(set));
}