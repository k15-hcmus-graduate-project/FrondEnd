// Stylesheet
import React, { Component } from "react";
import "./AdminAddBrand.scss";
import PropTypes from "prop-types";
import FormInput from "../../../common/FormInput";

class AdminAddBrand extends Component {
    static propTypes = {
        updateForm: PropTypes.func,
        editMode: PropTypes.bool
    };

    render = () => {
        return (
            <div>
                <form>
                    {/* PRODUCTNAME */}
                    <FormInput
                        label="Brand Name"
                        type="text"
                        value={this.props.formData.brand_name}
                        onChangeHandler={e => {
                            this.props.updateForm({
                                brand_name: e.target.value
                            });
                        }}
                    />
                </form>
            </div>
        );
    };
}

export default AdminAddBrand;
