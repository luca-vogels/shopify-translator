import styles from "./TextArea.module.css";
import DeepL from "../services/DeepL.service";
import Button from "./Button";
import React from "react";

const AI_NONE = 0;
const AI_PROCESSING = 1;
const AI_DONE = 2;

class TextArea extends React.Component {
    #refAiBut = React.createRef();
    #gotChanged = false;

    constructor(props){
        super(props);

        this.state = {
            initialValue: props.initialValue !== undefined ?  props.initialValue : props.children || "",
            value: props.value !== undefined ? column[defaultIdx] : props.initialValue || props.children || "",
            disabled: props.disabled ? true : false,
            aiState: AI_NONE
        };
    }
    
    #handleChange(event){
        if(this.state.disabled) return;
        this.#gotChanged = true;
        const newState = {...this.state, value: event.target.value, aiState: AI_NONE};
        this.setState(newState)
        if(this.props.onChange) this.props.onChange(event);
    }

    gotChanged(){
        return this.#gotChanged;
    }

    set(value, initialValue){
        this.#gotChanged = false;
        const newState = {...this.state, value, initialValue};
        this.setState(newState);
    }

    setInitialValue(initialValue){
        const newState = {...this.state, initialValue};
        this.setState(newState);
    }

    setValue(value){
        this.#gotChanged = false;
        const newState = {...this.state, value};
        this.setState(newState);
    }

    getValue(){
        return this.state.value;
    }

    setReadOnly(readOnly=true){
        const newState = {...this.state, disabled: readOnly};
        this.setState(newState);
    }

    #setAiState(aiState){
        const newState = {...this.state, aiState};
        this.setState(newState);
    }

    render(){

        // Reset button
        const resetButton = (this.props.butReset && this.state.value !== this.state.initialValue) ? (
            <Button type="button" title={this.props.TEXT['ResetToDefault']} disabled={this.state.disabled} onClick={(event) => {
                this.setValue(this.state.initialValue);
            }}>
                <img src="/images/content/icons/reset.svg" width="100%" height="100%" draggable={false} alt={this.props.TEXT['ResetToDefault']} />
            </Button>
        ) : null;

        // Edit / Lock button
        const editButton = this.props.butEdit ? (
            <Button type="button" title={this.props.TEXT[this.state.disabled ? 'Edit' : 'Lock']} onClick={(event) => {
                this.setReadOnly(!this.state.disabled);
            }}>
                <img src={"/images/content/icons/"+(this.state.disabled ? "edit" : "lock")+".svg"} width="100%" height="100%" 
                        draggable={false} alt={this.props.TEXT[this.state.disabled ? 'Edit' : 'Lock']} />
            </Button>
        ) : null;
        
        const aiButton = this.props.butAI ? (
            <Button ref={this.#refAiBut} disabled={this.state.aiState !== AI_NONE} type="button" title={this.props.TEXT['Auto']} 
            onClick={(event) => {
                if(this.state.aiState === AI_NONE){
                    this.#setAiState(AI_PROCESSING);
                    this.#refAiBut.current.setLoading(true);
                    DeepL.translate("auto", "de", this.state.value, (_, translation) => {
                        if(translation) this.setValue(translation);
                        this.#setAiState(AI_DONE);
                        this.#refAiBut.current.setLoading(false);
                    });
                }
            }}>{this.props.TEXT['Auto']}</Button>
        ) : null;

        return (
            <div className={styles.container}>
                <div>
                    <b>{this.props.title}</b>
                    {resetButton}
                    {editButton}
                    {aiButton}
                </div>
                <textarea name={this.props.name} value={this.state.value} 
                            disabled={this.state.disabled}
                            onChange={(event) => this.#handleChange(event)} onBlur={this.props.onBlur} />
            </div>
        );
    }


    static addTranslationKeys = function(set){
        [ // used translation keys
            'Auto', 'Edit', 'Lock', 'ResetToDefault'
        ].forEach((value) => set.add(value));
    
        [ // used components
            Button
        ].forEach((component) => component.addTranslationKeys(set));
    }
}

export default TextArea;