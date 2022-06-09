import styles from "./Layout.module.css";

export default function Layout({children, TEXT}){
    return (
        <div className={styles.layout}>
            <header><h1>{TEXT['NAME']}</h1></header>
            <div className={styles.main}>
                {children}
            </div>
            <footer><a href="https://luca-vogels.com">luca-vogels.com</a></footer>
        </div>
    )
}

Layout.addTranslationKeys = function(set){
    [ // used translation keys
        'NAME'
    ].forEach((value) => set.add(value));
}