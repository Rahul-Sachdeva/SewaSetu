import React from "react";
import "./css/AuthWrapper.css";

const AuthWrapper = ({children}) => {
    return (
        <div className = "auth-wrapper">
            <div className="auth-card">
                {children}
            </div>
        </div>
    )
};

export default AuthWrapper;

