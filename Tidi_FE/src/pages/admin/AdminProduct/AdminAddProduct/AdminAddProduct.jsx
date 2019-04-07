// Stylesheet
import React, { Component } from "react";
import "./AdminAddProduct.scss";
import FormInput from "../../../common/FormInput";

type Props = {
    brands: Array<any>,
    industries: Array<any>,
    branches: Array<any>,
    categories: Array<any>,
    updateForm: Function,
    editMode: Function,
    formData: Function
};
class AdminAddProduct extends Component<Props> {
    render = () => {
        const { formData, updateForm, changeBranchHandler, changeIndustryHandler, branches, categories, brands, industries } = this.props;

        if (!branches || !categories || !brands || !industries) return "";
        return (
            <div>
                <form>
                    {/* PRODUCTNAME */}
                    <div className="row">
                        <FormInput
                            label="Product Name"
                            type="text"
                            value={formData.product_name}
                            onChangeHandler={e =>
                                updateForm({
                                    product_name: e.target.value
                                })
                            }
                            additionalClass="col-md-6 col-sm-6"
                        />

                        {/* PRICE */}
                        <FormInput
                            label="Price"
                            type="text"
                            value={formData.price}
                            onChangeHandler={e =>
                                updateForm({
                                    price: e.target.value
                                })
                            }
                            additionalClass="col-md-3 col-sm-6"
                        />

                        {/* AMOUNT */}
                        <FormInput
                            label="Amount"
                            type="text"
                            value={formData.amount}
                            onChangeHandler={e =>
                                updateForm({
                                    amount: e.target.value
                                })
                            }
                            additionalClass="col-md-3 col-sm-6"
                        />
                    </div>

                    <div className="row">
                        {/* BRAND */}
                        <FormInput
                            label="Brand"
                            type="select"
                            value={formData.brand_id}
                            onChangeHandler={e =>
                                updateForm({
                                    brand_id: e.target.value
                                })
                            }
                            options={brands && brands.map(brand => ({ value: brand.id, name: brand.brand_name }))}
                            additionalClass="col-md-3 col-sm-6"
                        />

                        {/* INDUSTRY */}
                        <FormInput
                            label="Industry"
                            type="select"
                            value={formData.industry_id}
                            onChangeHandler={e => {
                                updateForm({
                                    industry_id: e.target.value
                                });
                                changeIndustryHandler(e.target.value);
                            }}
                            options={industries && industries.map(industry => ({ value: industry.id, name: industry.industry_name }))}
                            additionalClass="col-md-3 col-sm-6"
                        />

                        {/* BRANCH */}
                        <FormInput
                            label="Branch"
                            type="select"
                            value={formData.branch_id}
                            onChangeHandler={e => {
                                updateForm({
                                    branch_id: e.target.value
                                });
                                changeBranchHandler(e.target.value);
                            }}
                            options={branches && branches.map(branch => ({ value: branch.id, name: branch.branch_name }))}
                            additionalClass="col-md-3 col-sm-6"
                        />

                        {/* CATEGORY */}
                        <FormInput
                            label="Category"
                            type="select"
                            value={formData.category_id}
                            // innerHTML={formData.categoryName}
                            onChangeHandler={e =>
                                updateForm({
                                    category_id: e.target.value
                                })
                            }
                            options={categories && categories.map(category => ({ value: category.id, name: category.category_name }))}
                            additionalClass="col-md-3 col-sm-6"
                        />
                    </div>

                    {/* Images */}
                    <FormInput
                        label="Images"
                        type="textarea"
                        value={formData.images}
                        onChangeHandler={e =>
                            updateForm({
                                images: e.target.value
                            })
                        }
                        rows="7"
                    />

                    {/* DESCRIPTION */}
                    <FormInput
                        label="Description"
                        type="textarea"
                        value={formData.description}
                        onChangeHandler={e =>
                            updateForm({
                                description: e.target.value
                            })
                        }
                        rows="5"
                    />
                </form>
            </div>
        );
    };
}

export default AdminAddProduct;
