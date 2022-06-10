import { useState } from "react";
import styles from "./InputFile.module.css";

export default function InputFile({TEXT, className, style, name, accept, required, color="#82bf9e", border="#55806a", onChange}){
    const [fileName, setFileName] = useState(null);
    
    className = styles.file+(className ? " "+className : "");

    style = style || {};
    if(color){
        style.backgroundColor = color;
        style.outlineColor = color;
    }
    if(border){
        style.borderColor = border;
    }

    const handleOnChange = function(event){
        let fileName = (event.target.value || "").replaceAll("\\", "/");
        let idx = fileName.lastIndexOf("/");
        fileName = idx < 0 ? fileName : fileName.substring(idx+1);
        setFileName(fileName.length > 0 ? fileName : null);
        if(onChange) onChange(event);
    }

    return (
        <label className={className} style={style}>
            <input type="file" name={name} accept={accept} required={required} onChange={handleOnChange} />
            <img src="/images/content/icons/drop-target.svg" width="50%" height="50%" alt={TEXT['SelectFile']} />
            <b>{fileName || TEXT['SelectFile']}</b>
        </label>
    );
}

InputFile.addTranslationKeys = function(set){
    [ // used translation keys
        'SelectFile'
    ].forEach((value) => set.add(value));
}