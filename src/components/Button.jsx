import React from "react";
import styles from "./Button.module.css";

class Button extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading: false
        }
    }

    setLoading(loading=true){
        const newState = {...this.state, loading};
        this.setState(newState);
    }

    render(){
        return (
            <button className={styles.button+(this.state.loading ? " "+styles.loading  : "")+
                                                (this.props.className ? " "+this.props.className : "")} 
                    type={this.props.type} name={this.props.name} title={this.props.title} style={this.props.style}
                    disabled={this.props.disabled || this.state.loading} onClick={this.props.onClick}>
                        {this.props.children}
            </button>
        );
    }

    static addTranslationKeys(set){

    }
}

export default Button;