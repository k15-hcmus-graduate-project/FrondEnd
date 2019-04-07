// Stylsheet
import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import "./AdminProduct.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import HelperTool, { showAlert } from "../../../helpers/lib";
import { DEFAULT_FORMDATA, ACTIVE_TYPE } from "../../../config/constants";
import Modal from "../../common/Modal";
import AdminAddProduct from "./AdminAddProduct";
import Paginator from "../../common/Paginator";
import Message from "../../common/FormMessage";

const INTIAL_STATE = {
    showLoadingBar: false,
    message: null,
    brands: [],
    industries: [],
    selectedIndustryId: 0,
    branches: [],
    selectedBranchId: 0,
    categories: []
};

const INTERNAL_CONFIG = {
    HEADING_NAME: "Product",
    SEARCH_DELAY_DURATION: 300,
    PAGE_SIZE_ARR: [10, 25, 50, 100],
    MAIN_HEADERS: ["ID", "Product Name", "Price", "In Stock", "Brand", "Category", "Active", "Actions"],
    DETAIL_HEADERS: ["Images", "Description"]
};
type State = {
    brands: Array<any>,
    industries: Array<any>,
    branches: Array<any>,
    categories: Array<any>,
    showLoadingBar: boolean,
    message: Object,
    selectedIndustryId: number,
    selectedBranchId: number
};

class AdminProduct extends Component<State> {
    static propTypes = {
        currentPage: PropTypes.number,
        pageSize: PropTypes.number,
        totalItems: PropTypes.number,
        fetchProducts: PropTypes.func,
        changePageInfo: PropTypes.func,
        query: PropTypes.shape({
            keyword: PropTypes.string
        }),
        formData: PropTypes.object
    };

    productToBlock = null;
    originalProductInfo = {};
    searchInterval = null;
    _isMounted = false;

    constructor(props: any) {
        super(props);
        this.orignalBranches = [];
        this.originalCategories = [];
        this.state = INTIAL_STATE;
        this.props.changePageInfo({
            currentPage: 1,
            pageSize: INTERNAL_CONFIG.PAGE_SIZE_ARR[0]
        });
    }

    componentWillMount = () => {
        const params = new URLSearchParams(this.props.history.location.search);
        const pageIndex = Number(params.get("page"));
        const pageSize = Number(params.get("size"));
        if (pageIndex && pageSize && INTERNAL_CONFIG.PAGE_SIZE_ARR.indexOf(pageSize) !== -1) {
            this.handleFilterChange({
                currentPage: pageIndex,
                pageSize: pageSize
            });
        } else {
            const { currentPage, query } = this.props;
            this.fetchProducts(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0], query);
            this.updateURLParams(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0]);
        }

        this.fetchAllBrands();
        this.fetchAllIndustries();
        this.fetchAllBranches();
        this.fetchAllCategories();
    };

    componentDidMount = () => {
        this._isMounted = true;
    };

    componentWillUnmount = () => {
        this._isMounted = false;
    };

    updateURLParams = (currentPage, pageSize) => {
        this.props.history.push({
            search: `?size=${pageSize || this.props.pageSize}&page=${currentPage || this.props.currentPage}`
        });
    };

    fetchProducts = (currentPage, pageSize, query = {}) => {
        this.setState({
            showLoadingBar: true
        });
        WebService.adminGetAllProducts(AuthService.getTokenUnsafe(), pageSize, (currentPage - 1) * pageSize, query)
            .then(res => {
                const result = JSON.parse(res);
                if (result.status === ACTIVE_TYPE.TRUE && result.products) {
                    this.props.fetchProducts(result.products);
                    this.handleFilterChange({
                        totalItems: result.totalItems
                    });

                    if (this._isMounted) {
                        this.setState({
                            showLoadingBar: false
                        });
                    }
                } else {
                    showAlert(result.message, "error");
                }
            })
            .catch(err => {
                console.log("Have error when get admin products.", err);
            });
    };

    fetchAllBrands = () => {
        WebService.adminGetAllBrands(AuthService.getTokenUnsafe(), 10000, 0, {})
            .then(res => {
                const result = JSON.parse(res);
                if (result.status && result.status === ACTIVE_TYPE.TRUE) {
                    if (this._isMounted) {
                        this.setState({
                            brands: result.brands
                        });
                    }
                }
            })
            .catch(err => {
                console.log("error when get brands.");
            });
    };

    fetchAllIndustries = () => {
        WebService.adminGetAllIndustries(AuthService.getTokenUnsafe(), 10000, 0, {}).then(res => {
            const result = JSON.parse(res);
            if (result.status && result.status === ACTIVE_TYPE.TRUE) {
                if (this._isMounted) {
                    this.setState({
                        industries: result.industries
                    });
                }
            }
        });
    };

    fetchAllBranches = () => {
        WebService.adminGetAllBranches(AuthService.getTokenUnsafe(), 10000, 0, {}).then(res => {
            const result = JSON.parse(res);
            if (result.status && result.status === ACTIVE_TYPE.TRUE) {
                this.orignalBranches = result.branches;
                this.handleIndustryChange(this.props.formData.industry_id);
            }
        });
    };

    fetchAllCategories = () => {
        WebService.adminGetAllCategories(AuthService.getTokenUnsafe(), 10000, 0, {}).then(res => {
            const result = JSON.parse(res);

            if (result.status && result.status === ACTIVE_TYPE.TRUE) {
                this.originalCategories = result.categories;
                this.handleBranchChange(this.props.formData.branch_id);
            }
        });
    };

    prepareFormData = data => {
        this.setState({
            message: null
        });
        for (let attr in data) {
            if (!(attr in DEFAULT_FORMDATA.AdminAddProduct) && data[attr]) {
                console.log(data[attr]);
                data[attr + "Id"] = data[attr].id;
                delete data[attr];
            } else if (data[attr] === null) {
                data[attr] = "";
            }
        }
        this.originalProductInfo = data;
        this.props.setFormData(data);
    };

    clearFormData = () => {
        this.setState({
            message: null
        });

        this.props.setFormData(DEFAULT_FORMDATA.AdminAddProduct);
    };

    handleIndustryChange = newIndustryId => {
        const filteredBranches = this.orignalBranches.filter(branch => branch.industry_id === parseInt(newIndustryId));
        this.setState({
            branches: filteredBranches
        });
        this.handleBranchChange(filteredBranches[0] && filteredBranches[0].id);
    };

    handleBranchChange = newBranchId => {
        if (newBranchId && this.originalCategories) {
            this.setState({
                categories: this.originalCategories.filter(cat => cat.branch_id === parseInt(newBranchId))
            });
        } else {
            this.setState({
                categories: []
            });
        }
    };

    handleFilterChange = ({ currentPage, pageSize, totalItems }) => {
        let payloadObj = {};

        if (currentPage) {
            payloadObj.currentPage = Number(currentPage);
        }

        if (pageSize) {
            payloadObj.pageSize = Number(pageSize);
        }

        if (totalItems) {
            payloadObj.totalItems = Number(totalItems);
        }

        this.props.changePageInfo(payloadObj);

        if (pageSize || currentPage) {
            this.updateURLParams(payloadObj.currentPage, payloadObj.pageSize);
            this.fetchProducts(
                payloadObj.currentPage || this.props.currentPage,
                payloadObj.pageSize || this.props.pageSize,
                this.props.query
            );
        }
    };

    handleChangeKeyword = e => {
        this.props.updateFilter({ keyword: e.target.value });
        clearTimeout(this.searchInterval);
        this.searchInterval = setTimeout(() => {
            this.handleSearch();
        }, INTERNAL_CONFIG.SEARCH_DELAY_DURATION);
    };

    handleSearch = () => {
        this.fetchProducts(this.props.currentPage, this.props.pageSize, this.props.query);
    };

    handleUpdateProduct = () => {
        const { formData, productName, currentPage, pageSize, query } = this.props;
        return new Promise((resolve, reject) => {
            const newInfo = {};
            for (let attr in formData) {
                if (attr !== "password" && formData[attr] !== this.originalProductInfo[attr]) {
                    newInfo[attr] = formData[attr];
                }
            }
            if (Object.keys(newInfo).length > 0) {
                this.setState({
                    message: <Message content="Updating product..." />
                });

                WebService.adminUpdateProduct(AuthService.getTokenUnsafe(), formData.id, newInfo).then(res => {
                    const resObj = JSON.parse(res);
                    console.log(resObj);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: <Message color="green" content="Update product successfully" />
                        });

                        resolve(true);
                        if ("permission" in newInfo && formData.product_name === productName) {
                            window.location.reload();
                        } else {
                            this.fetchProducts(currentPage, pageSize, query);
                        }
                    } else {
                        this.setState({
                            message: <Message color="red" content={resObj.message} />
                        });
                        console.log("UPDATE FAILED", resObj);
                        resolve(false);
                    }
                });
            } else {
                resolve(false);
                this.setState({
                    message: <Message content="Nothing to update.." />
                });
            }
        });
    };

    handleAddProduct = () => {
        const { formData, currentPage, pageSize, query } = this.props;

        return new Promise((resolve, reject) => {
            this.setState({
                message: <Message content="Creating product..." />
            });

            if (!formData.product_name) {
                this.setState({
                    message: <Message color="red" content="Product Name is empty" />
                });
            } else if (!formData.price) {
                this.setState({
                    message: <Message color="red" content="Price is invalid" />
                });
            } else if (!formData.amount) {
                this.setState({
                    message: <Message color="red" content="Amount is invalid" />
                });
            } else if (!formData.images) {
                this.setState({
                    message: <Message color="red" content="Images is empty" />
                });
            } else {
                WebService.adminInsertProduct(AuthService.getTokenUnsafe(), formData).then(res => {
                    const resObj = JSON.parse(res);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: <Message color="green" content="Create product successfully" />
                        });

                        resolve(true);
                        this.fetchProducts(currentPage, pageSize, query);
                    } else {
                        this.setState({
                            message: <Message color="red" content={resObj.message} />
                        });
                        console.log("ADD FAILED", resObj);
                        resolve(false);
                    }
                });
            }
        });
    };

    handleDeleteProduct = () => {
        return new Promise(resolve => {
            if (this.productToBlock && this.productToBlock.id) {
                WebService.adminUpdateProduct(AuthService.getTokenUnsafe(), this.productToBlock.id, {
                    active: this.productToBlock.active === ACTIVE_TYPE.TRUE ? ACTIVE_TYPE.FALSE : ACTIVE_TYPE.TRUE
                }).then(res => {
                    const resObj = JSON.parse(res);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: (
                                <Message
                                    color="green"
                                    content={
                                        (this.productToBlock.active === ACTIVE_TYPE.TRUE ? "Block" : "Unblock") + "product successfully"
                                    }
                                />
                            )
                        });

                        resolve(true);
                        this.fetchProducts(this.props.currentPage, this.props.pageSize, this.props.query);
                    } else {
                        this.setState({
                            message: <Message color="red" content={resObj.message} />
                        });
                        console.log("UPDATE BLOCK STATUS FAILED", resObj);
                        resolve(false);
                    }
                });
            }
        });
    };

    generateTableRows = products => {
        let r = [];
        if (!products || products.length === 0) return;
        products.forEach((product, id) => {
            let productImages;
            try {
                productImages = JSON.parse(product.images);
            } catch (e) {
                productImages = [];
            }
            let randomStr = HelperTool.generateRandomString();
            r.push(
                <Fragment key={id}>
                    <tr>
                        <td>{product.id}</td>
                        <td>{product.product_name}</td>
                        <td>{HelperTool.withCommas(product.price)} ₫</td>
                        <td>{product.amount}</td>
                        <td>{product.brand.brand_name}</td>
                        <td>{`${product.category.category_name}, ${product.branch.branch_name}, ${product.industry.industry_name}`}</td>
                        <td>
                            {product.active === ACTIVE_TYPE.TRUE ? <i className="fa fa-check" /> : <i className="fa fa-times-circle" />}
                        </td>
                        <td>
                            <div className="btn-group">
                                <button
                                    className="btn btn-info btn-sm"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target={"#detailbox" + randomStr}
                                    aria-expanded="false"
                                    aria-controls="collapseExample"
                                >
                                    <i className="fa fa-info-circle" /> Detail
                                </button>
                                &#160;&#160;
                                <button
                                    className="btn btn-warning btn-sm"
                                    data-toggle="modal"
                                    data-target="#update-product-modal"
                                    onClick={() => this.prepareFormData({ ...product })}
                                >
                                    <i className="fa fa-pencil-square-o" /> Edit
                                </button>
                                &#160;&#160;
                                <button
                                    className="btn btn-danger btn-sm"
                                    data-toggle="modal"
                                    data-target="#delete-product-modal"
                                    onClick={() => {
                                        this.productToBlock = product;
                                    }}
                                >
                                    <i className="fa fa-ban" /> {product.active === ACTIVE_TYPE.TRUE ? "Block" : "Unblock"}
                                </button>
                            </div>
                        </td>
                    </tr>

                    {/* ROW DETAIL */}
                    <tr className="collapse no-hover" id={"detailbox" + randomStr}>
                        <td colSpan={INTERNAL_CONFIG.MAIN_HEADERS.length}>
                            <div className="card card-body" style={{ border: "none" }}>
                                <table className="table table-sm">
                                    <thead>{HelperTool.generateTableHeaders(INTERNAL_CONFIG.DETAIL_HEADERS)}</thead>
                                    <tbody>
                                        <tr>
                                            <td className="text-center">
                                                {productImages.map((imgUrl, idx) => (
                                                    <img key={idx} src={imgUrl} className="m-1" alt="NONE" style={{ width: 54 }} />
                                                ))}
                                                <button>
                                                    <i className="fa fa-plus-circle" />
                                                </button>
                                            </td>
                                            <td>{product.description}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </Fragment>
            );
        });

        return r;
    };

    render = () => {
        const { products, currentPage, pageSize, query, totalItems } = this.props;
        const { branches, brands, industries, categories, message, showLoadingBar } = this.state;
        return (
            <div className="container-fluid">
                <Modal
                    modalId="add-product-modal"
                    modalTitle="Create new product"
                    modalBody={
                        <AdminAddProduct
                            brands={brands}
                            industries={industries}
                            branches={branches}
                            categories={categories}
                            changeIndustryHandler={this.handleIndustryChange}
                            changeBranchHandler={this.handleBranchChange}
                        />
                    }
                    modalHandleSubmit={this.handleAddProduct}
                    modalSubmitTitle="Add"
                    modalSubmitClassName="btn-success"
                    modalMessage={message}
                />
                <Modal
                    modalId="update-product-modal"
                    modalTitle="Update product info"
                    modalBody={
                        <AdminAddProduct
                            editMode={true}
                            brands={brands}
                            industries={industries}
                            branches={branches}
                            categories={categories}
                            changeIndustryHandler={this.handleIndustryChange}
                            changeBranchHandler={this.handleBranchChange}
                        />
                    }
                    modalHandleSubmit={this.handleUpdateProduct}
                    modalSubmitTitle="Update"
                    modalSubmitClassName="btn-warning"
                    modalMessage={message}
                />
                <Modal
                    modalId="delete-product-modal"
                    modalTitle="Update product info"
                    modalBody={<div>Are you sure to Block/Unblock this product?</div>}
                    modalHandleSubmit={this.handleDeleteProduct}
                    modalSubmitTitle="Block/Unblock"
                    modalSubmitClassName="btn-danger"
                />
                <h2>{INTERNAL_CONFIG.HEADING_NAME}</h2>
                <hr />
                <div className="card">
                    <div className="card-header d-flex justify-content-end">
                        <input
                            className="search-bar form-control col-md-4 col-sm-6"
                            type="text"
                            placeholder="Search for something..."
                            value={query.keyword}
                            onChange={e => this.handleChangeKeyword(e)}
                            onKeyDown={e => e.keyCode === 13 && this.handleSearch()}
                        />
                    </div>
                    <div className="card-body">
                        <div className="controllers d-flex">
                            <div>
                                <select
                                    className="form-control input-sm"
                                    value={pageSize}
                                    onChange={e => {
                                        this.handleFilterChange({
                                            pageSize: e.target.value
                                        });
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                            <div className="control-buttons btn-group justify-content-space-between">
                                {/* <!-- Button trigger modal --> */}
                                <button
                                    className="btn btn-success"
                                    data-toggle="modal"
                                    data-target="#add-product-modal"
                                    onClick={() => {
                                        this.clearFormData();
                                    }}
                                >
                                    <i className="fa fa-plus-circle mr-2" />
                                    Add product
                                </button>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>
                                Display {pageSize * currentPage > totalItems ? totalItems : pageSize * currentPage} / {totalItems}
                            </span>
                            <span>{message}</span>
                        </div>
                        <div className="table-container" style={{ position: "relative" }}>
                            <div
                                className="progress"
                                style={{ width: "100%", height: 5, position: "absolute" }}
                                hidden={showLoadingBar ? "" : "hidden"}
                            >
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                    role="progressbar"
                                    aria-valuenow="75"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div className="table-container table-responsive">
                                <table className="table table-hover table-sm table-bordered">
                                    <thead>{HelperTool.generateTableHeaders(INTERNAL_CONFIG.MAIN_HEADERS)}</thead>
                                    <tbody>{this.generateTableRows(products)}</tbody>
                                </table>
                                <Paginator
                                    handlePageChange={currentPage => {
                                        this.handleFilterChange({ currentPage });
                                    }}
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    totalItems={totalItems}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default AdminProduct;
