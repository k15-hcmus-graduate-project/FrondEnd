// Stylesheet
import React, { Component } from "react";
import "./AdminAddStore.scss";
import FormInput from "../../../common/FormInput";

type Props = {
    updateForm: Function,
    stores: Array<any>,
    editMode: Boolean,
    formData: object
};
class AdminAddStore extends Component<Props> {
    render = () => {
        const { formData, updateForm, stores, editMode } = this.props;
        if (!stores && editMode === true) return "";
        return (
            <div>
                <form>
                    {editMode === true && (
                        <div className="row">
                            <FormInput
                                label="Product Name"
                                disabled={true}
                                type="text"
                                value={formData.product_name}
                                additionalClass="col-md-10 col-sm-10"
                            />
                        </div>
                    )}
                    {/* Store name */}
                    <div className="row">
                        {editMode === !true && (
                            <FormInput
                                label="Store Name"
                                type="text"
                                value={formData.store_name}
                                onChangeHandler={e =>
                                    updateForm({
                                        store_name: e.target.value
                                    })
                                }
                                additionalClass="col-md-6 col-sm-6"
                            />
                        )}
                        {editMode === true && (
                            <FormInput
                                label="Store name"
                                type="select"
                                // value={formData.store_name}
                                onChangeHandler={e => {
                                    if (!formData.store_address.includes(e.target.value)) {
                                        console.log(e.target.value);
                                        updateForm({
                                            store_address: formData.store_address + " " + e.target.value
                                        });
                                    }
                                }}
                                options={stores && stores.map(store => ({ value: store.name, name: store.address }))}
                                additionalClass="col-md-3 col-sm-6"
                            />
                        )}
                        <FormInput
                            label="Store Address"
                            type="text"
                            value={formData.store_address}
                            onChangeHandler={e =>
                                updateForm({
                                    store_address: e.target.value
                                })
                            }
                            additionalClass="col-md-6 col-sm-6"
                        />
                    </div>
                </form>
            </div>
        );
    };
}

export default AdminAddStore;
