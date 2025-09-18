import React from "react";

const InputField = ({type, placeholder, name}) => {
    return (
        <input
            type = {type}
            name = {name}
            placeholder = {placeholder}
            className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
        />
    );
};

export default InputField;
