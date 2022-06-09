import Image from "next/image";
import LanguageSelector from "./LanguageSelector";
import styles from "./Layout.module.css";

export default function Layout({children, LANGUAGE_NAMES, TEXT}){
    return (
        <div className={styles.layout}>
            <header><h1>{TEXT['NAME']}</h1></header>
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
}