import styles from "./Arrow.module.css";

export const ARROW_RIGHT=0;
export const ARROW_DOWN=90;
export const ARROW_LEFT=180;
export const ARROW_UP=270;

export default function Arrow({rotation=0, className}){
    className = styles.arrow+(className ? " "+className : "");
    return (
        <div className={className} style={{transform:'rotate('+rotation+'deg)'}}></div>
    );
}

Arrow.addTranslationKeys = function(set){
    
}