import React from "react";
import "./css/Button.css";

const Button = ({type, variant, text, onClick}) => {
    const baseClass = "component-btn";
    const variantClass = variant === "primary" ? "component-btn-primary":"component-btn-secondary";

    return (
        <button type={type} onClick={onClick} className={`${baseClass} ${variantClass}`}>
            {text}
        </button>
    );
};

export default Button;
