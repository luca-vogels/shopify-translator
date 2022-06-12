import { useEffect, useRef } from "react";
import LanguageSelector from "./LanguageSelector";
import styles from "./Layout.module.css";

export default function Layout({children, LANGUAGE_NAMES, TEXT}){
    const refContainer = useRef(null);

    const updateMinHeight = function(){
        refContainer.current.style.minHeight = window.innerHeight+"px";
    }

    useEffect(() => {
        window.removeEventListener("resize", updateMinHeight);
        window.addEventListener("resize", updateMinHeight);
        updateMinHeight();
    });

    return (
        <div ref={refContainer} className={styles.layout}>
            <header><a href="/" className="nodrag noselect"><h1>{TEXT['NAME']}</h1></a></header>
            <div className={styles.main}>
                {children}
            </div>
            <footer>
                <a href="https://github.com/luca-vogels/shopify-translator">
                    <img src="https://github.com/favicon.ico" width={16} height={16} draggable={false} alt="GitHub.com" />
                    <span>GitHub.com</span>
                </a>
                <a href="https://luca-vogels.com">
                    <img src="https://luca-vogels.com/favicon.ico" width={16} height={16} draggable={false} alt="Luca-Vogels.com" />
                    <span>luca-vogels.com</span>
                </a>
                <LanguageSelector LANGUAGE_NAMES={LANGUAGE_NAMES} openUpwards={true} />
            </footer>
        </div>
    )
}

Layout.addTranslationKeys = function(set){
    [ // used translation keys
        'NAME'
    ].forEach((value) => set.add(value));

    [ // used components
        LanguageSelector
    ].forEach((component) => component.addTranslationKeys(set));
}