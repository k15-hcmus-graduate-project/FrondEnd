// External dependencies
import React, { Component } from "react";
import PropTypes from "prop-types";
class FormInput extends Component {
    static propTypes = {
        type: PropTypes.string.isRequired,
        label: PropTypes.string,
        smallLabel: PropTypes.string,
        value: PropTypes.any.isRequired,
        onChangeHandler: PropTypes.func.isRequired,
        options: PropTypes.array,
        additionalClass: PropTypes.string,
        disabled: PropTypes.bool
    };

    render = () => {
        const generateInput = inputType => {
            const { value, onChangeHandler, disabled, options, rows } = this.props;
            switch (inputType.toLowerCase()) {
                case "select":
                    return (
                        <select type="text" className="form-control" value={value} onChange={onChangeHandler} disabled={disabled}>
                            {options.map((opt, idx) => (
                                <option key={idx} value={opt.value || opt}>
                                    {opt.name || opt}
                                </option>
                            ))}
                        </select>
                    );

                case "textarea":
                    return <textarea className="form-control" value={value} onChange={onChangeHandler} rows={rows} disabled={disabled} />;

                default:
                    return <input className="form-control" type={type} value={value} onChange={onChangeHandler} disabled={disabled} />;
            }
        };

        const { additionalClass, label, type, smallLabel } = this.props;
        return (
            <div className={"form-group " + additionalClass}>
                {label && <label>{label}</label>}
                {generateInput(type)}
                {smallLabel && <small className="form-text text-muted" />}
            </div>
        );
    };
}

export default FormInput;
