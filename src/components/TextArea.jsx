import { useRef, useState } from "react";
import styles from "./TextArea.module.css";
import DeepL from "../services/DeepL.service";
import Button from "./Button";

const AI_NONE = 0;
const AI_PROCESSING = 1;
const AI_DONE = 2;

export default function TextArea({TEXT, children: initialValue, defaultValue, name, title, disabled, butReset, butEdit, butAI, onChange, onBlur}){
    defaultValue = defaultValue || "";
    initialValue = initialValue || defaultValue;
    const refAiBut = useRef(null);
    const [value, setValue] = useState(initialValue);
    const [readOnly, setReadOnly] = useState(disabled ? true : false);
    const [aiState, setAiState] = useState(AI_NONE);
    let isButtonPressed = false;

    if(value !== initialValue) setValue(initialValue); // needed to change state on rerender

    const handleChange = function(event){
        if(readOnly) return;
        setValue(event.target.value);
        setAiState(AI_NONE);
        if(onChange) onChange(event);
    }

    const handleBlur = function(event){
        setTimeout(() => {
            event.isButtonPressed = isButtonPressed;
            onBlur(event);
        }, 100);
    }

    // Reset button
    const resetButton = (butReset && value !== initialValue) ? (
        <Button type="button" title={TEXT['ResetToDefault']} disabled={readOnly} onClick={(event) => {
            isButtonPressed = true;
            setValue(initialValue);
        }}>
            <img src="/images/content/icons/reset.svg" width="100%" height="100%" draggable={false} alt={TEXT['ResetToDefault']} />
        </Button>
    ) : null;

    // Edit / Lock button
    const editButton = butEdit ? (
        <Button type="button" title={TEXT[readOnly ? 'Edit' : 'Lock']} onClick={(event) => {
            setReadOnly(!readOnly);
        }}>
            <img src={"/images/content/icons/"+(readOnly ? "edit" : "lock")+".svg"} width="100%" height="100%" 
                    draggable={false} alt={TEXT[readOnly ? 'Edit' : 'Lock']} />
        </Button>
    ) : null;
    
    const aiButton = butAI ? (
        <Button ref={refAiBut} disabled={aiState !== AI_NONE} type="button" title={TEXT['Auto']} onClick={(event) => {
            if(aiState === AI_NONE){
                setAiState(AI_PROCESSING);
                refAiBut.current.setLoading(true);
                DeepL.translate("auto", "de", value, (_, translation) => {
                    if(translation) setValue(translation);
                    setAiState(AI_DONE);
                    refAiBut.current.setLoading(false);
                });
            }
        }}>{TEXT['Auto']}</Button>
    ) : null;

    return (
        <div className={styles.container}>
            <div>
                <b>{title}</b>
                {resetButton}
                {editButton}
                {aiButton}
            </div>
            <textarea name={name} value={value} onChange={handleChange} onBlur={handleBlur} disabled={readOnly} />
        </div>
    );
}

TextArea.addTranslationKeys = function(set){
    [ // used translation keys
        'Auto', 'Edit', 'Lock', 'ResetToDefault'
    ].forEach((value) => set.add(value));

    [ // used components
        Button
    ].forEach((component) => component.addTranslationKeys(set));
}