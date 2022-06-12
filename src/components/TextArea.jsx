import { useState } from "react";
import styles from "./TextArea.module.css";
import DeepL from "../services/DeepL.service";

const AI_NONE = 0;
const AI_PROCESSING = 1;
const AI_DONE = 2;

export default function TextArea({TEXT, children: initialValue, defaultValue, name, title, disabled, butReset, butEdit, butAI, onChange, onBlur}){
    defaultValue = defaultValue || "";
    initialValue = initialValue || defaultValue;
    const [value, setValue] = useState(initialValue);
    const [readOnly, setReadOnly] = useState(disabled ? true : false);
    const [aiState, setAiState] = useState(AI_NONE);

    const handleChange = function(event){
        if(readOnly) return;
        setValue(event.target.value);
        setAiState(AI_NONE);
        if(onChange) onChange(event);
    }

    // Reset button
    const resetButton = (butReset && value !== initialValue) ? (
        <button type="button" title={TEXT['ResetToDefault']} disabled={readOnly} onClick={(event) => {
            setValue(initialValue);
        }}>
            <img src="/images/content/icons/reset.svg" width="100%" height="100%" draggable={false} alt={TEXT['ResetToDefault']} />
        </button>
    ) : null;

    // Edit / Lock button
    const editButton = butEdit ? (
        <button type="button" title={TEXT[readOnly ? 'Edit' : 'Lock']} onClick={(event) => {
            setReadOnly(!readOnly);
        }}>
            <img src={"/images/content/icons/"+(readOnly ? "edit" : "lock")+".svg"} width="100%" height="100%" 
                    draggable={false} alt={TEXT[readOnly ? 'Edit' : 'Lock']} />
        </button>
    ) : null;
    
    const aiButton = butAI ? (
        <button className={aiState === AI_PROCESSING ? styles.loading : undefined} 
                disabled={aiState !== AI_NONE}
                type="button" title={TEXT['Auto']} onClick={(event) => {
            if(aiState === AI_NONE){
                setAiState(AI_PROCESSING);
                DeepL.translate("auto", "de", value, (_, translation) => {
                    if(translation) setValue(translation);
                    setAiState(AI_DONE);
                });
            }
        }}>{TEXT['Auto']}</button>
    ) : null;

    return (
        <div className={styles.container}>
            <div>
                <b>{title}</b>
                {resetButton}
                {editButton}
                {aiButton}
            </div>
            <textarea name={name} value={value} onChange={handleChange}  onBlur={onBlur} disabled={readOnly} />
        </div>
    );
}

TextArea.addTranslationKeys = function(set){
    [ // used translation keys
        'Auto', 'Edit', 'Lock', 'ResetToDefault'
    ].forEach((value) => set.add(value));
}