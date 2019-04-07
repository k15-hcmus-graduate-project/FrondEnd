// Stylsheet
import React, { Fragment } from "react";
import PropTypes from "prop-types";
import "./AdminBrand.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import HelperTool, { showAlert } from "../../../helpers/lib";
import { DEFAULT_FORMDATA, ACTIVE_TYPE } from "../../../config/constants";
import Modal from "../../common/Modal";
import AdminAddBrand from "./AdminAddBrand";
import Paginator from "../../common/Paginator";
import Message from "../../common/FormMessage";

const INTIAL_STATE = {
    showLoadingBar: false,
    message: null,
    brands: []
};

const INTERNAL_CONFIG = {
    HEADING_NAME: "Brand",
    SEARCH_DELAY_DURATION: 300,
    PAGE_SIZE_ARR: [10, 25, 50, 100],
    MAIN_HEADERS: ["ID", "Brand Name", "Active", "Actions"]
};

class AdminBrand extends React.Component {
    static propTypes = {
        currentPage: PropTypes.number,
        pageSize: PropTypes.number,
        totalItems: PropTypes.number,
        fetchBrands: PropTypes.func,
        changePageInfo: PropTypes.func,
        setFormData: PropTypes.func,
        query: PropTypes.shape({
            keyword: PropTypes.string
        })
    };

    brandToBlock = null;
    originalBrandInfo = {};
    searchInterval = null;

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
        const { history, currentPage } = this.props;
        const params = new URLSearchParams(history.location.search);
        const pageIndex = Number(params.get("page"));
        const pageSize = Number(params.get("size"));
        if (pageIndex && pageSize && INTERNAL_CONFIG.PAGE_SIZE_ARR.indexOf(pageSize) !== -1) {
            this.handleFilterChange({
                currentPage: pageIndex,
                pageSize: pageSize
            });
        } else {
            this.fetchBrands(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0]);
            this.updateURLParams(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0]);
        }

        this.fetchBrands(currentPage, this.props.pageSize);
    };

    updateURLParams = (currentPage, pageSize) => {
        this.props.history.push({
            search: `?size=${pageSize || this.props.pageSize}&page=${currentPage || this.props.currentPage}`
        });
    };

    fetchBrands = (currentPage, currentSize, query) => {
        this.setState({
            showLoadingBar: true
        });

        WebService.adminGetAllBrandsBrand(AuthService.getTokenUnsafe(), currentSize, (currentPage - 1) * currentSize, query).then(res => {
            const result = JSON.parse(res);
            if (result.status && result.status === ACTIVE_TYPE.TRUE) {
                this.setState({
                    brands: result.brands,
                    showLoadingBar: false
                });
                if (result.brands) {
                    this.props.changePageInfo({ totalItems: result.totalItems });
                } else {
                    console.log("have no brands.");
                }
            } else {
                showAlert(result.message, "error");
            }
        });
    };

    prepareFormData = data => {
        this.setState({
            message: null
        });

        for (let attr in data) {
            if (!(attr in DEFAULT_FORMDATA.AdminAddBrand) && !data[attr]) {
                data[attr + "Id"] = data[attr].id;
                delete data[attr];
            } else if (data[attr] === null) {
                data[attr] = "";
            }
        }

        this.originalBrandInfo = data;
        this.props.setFormData(data);
    };

    clearFormData = () => {
        this.setState({
            message: null
        });

        this.props.setFormData(DEFAULT_FORMDATA.AdminAddBrand);
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
            this.fetchBrands(
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
        this.fetchBrands(this.props.currentPage, this.props.pageSize, this.props.query);
    };

    handleUpdateBrand = () => {
        const { formData, brandName, currentPage, pageSize, query } = this.props;
        return new Promise((resolve, reject) => {
            const newInfo = {};
            for (let attr in formData) {
                if (formData[attr] !== this.originalBrandInfo[attr]) {
                    newInfo[attr] = formData[attr];
                }
            }

            if (Object.keys(newInfo).length > 0) {
                this.setState({
                    message: <Message content="Updating brand..." />
                });

                WebService.adminUpdateBrand(AuthService.getTokenUnsafe(), formData.id, newInfo).then(res => {
                    const resObj = JSON.parse(res);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: <Message color="green" content="Update brand successfully" />
                        });

                        resolve(true);
                        if ("permission" in newInfo && formData.brand_name === brandName) {
                            window.location.reload();
                        } else {
                            this.fetchBrands(currentPage, pageSize, query);
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
                    message: <Message color="red" content="Nothing to update" />
                });
            }
        });
    };

    handleAddBrand = () => {
        const { formData, currentPage, pageSize, query } = this.props;

        return new Promise((resolve, reject) => {
            this.setState({
                message: <Message content="Creating brand..." />
            });

            if (!formData.brand_name) {
                this.setState({
                    message: <Message color="red" content="Brand Name is empty" />
                });
            } else {
                WebService.adminInsertBrand(AuthService.getTokenUnsafe(), formData).then(res => {
                    const resObj = JSON.parse(res);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: <Message color="green" content="Create brand successfully" />
                        });

                        resolve(true);
                        this.fetchBrands(currentPage, pageSize, query);
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

    handleDeleteBrand = () => {
        return new Promise(resolve => {
            if (this.brandToBlock && this.brandToBlock.id) {
                WebService.adminUpdateBrand(AuthService.getTokenUnsafe(), this.brandToBlock.id, {
                    active: this.brandToBlock.active === ACTIVE_TYPE.TRUE ? ACTIVE_TYPE.FALSE : ACTIVE_TYPE.TRUE
                }).then(res => {
                    const resObj = JSON.parse(res);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: (
                                <Message
                                    color="green"
                                    content={(this.brandToBlock.active === ACTIVE_TYPE.TRUE ? "Block" : "Unblock") + "brand successfully"}
                                />
                            )
                        });

                        resolve(true);
                        this.fetchBrands(this.props.currentPage, this.props.pageSize, this.props.query);
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

    generateTableRows = brands => {
        let r = [];
        brands.forEach((brand, id) => {
            r.push(
                <Fragment key={id}>
                    <tr>
                        <td>{brand.id}</td>
                        <td>{brand.brand_name}</td>
                        <td>{brand.active === ACTIVE_TYPE.TRUE ? <i className="fa fa-check" /> : <i className="fa fa-times-circle" />}</td>
                        <td>
                            <div className="btn-group">
                                <button
                                    className="btn btn-warning btn-sm"
                                    data-toggle="modal"
                                    data-target="#update-brand-modal"
                                    onClick={() => this.prepareFormData({ ...brand })}
                                >
                                    <i className="fa fa-pencil-square-o" /> Edit
                                </button>
                                &#160;&#160;
                                <button
                                    className="btn btn-danger btn-sm"
                                    data-toggle="modal"
                                    data-target="#delete-brand-modal"
                                    onClick={() => {
                                        this.brandToBlock = brand;
                                    }}
                                >
                                    <i className="fa fa-ban" /> {brand.active === ACTIVE_TYPE.TRUE ? "Block" : "Unblock"}
                                </button>
                            </div>
                        </td>
                    </tr>
                </Fragment>
            );
        });
        return r;
    };

    render = () => {
        const { pageSize, currentPage, query, totalItems } = this.props;
        const { message, showLoadingBar, brands } = this.state;
        return (
            <div className="container-fluid">
                <Modal
                    modalId="add-brand-modal"
                    modalTitle="Create new brand"
                    modalBody={<AdminAddBrand />}
                    modalHandleSubmit={this.handleAddBrand}
                    modalSubmitTitle="Add"
                    modalSubmitClassName="btn-success"
                    modalMessage={message}
                />
                <Modal
                    modalId="update-brand-modal"
                    modalTitle="Update brand info"
                    modalBody={<AdminAddBrand editMode={true} />}
                    modalHandleSubmit={this.handleUpdateBrand}
                    modalSubmitTitle="Update"
                    modalSubmitClassName="btn-warning"
                    modalMessage={message}
                />
                <Modal
                    modalId="delete-brand-modal"
                    modalTitle="Update brand info"
                    modalBody={<div>Are you sure to Block/Unblock this brand?</div>}
                    modalHandleSubmit={this.handleDeleteBrand}
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
                                    data-target="#add-brand-modal"
                                    onClick={() => {
                                        this.clearFormData();
                                    }}
                                >
                                    <i className="fa fa-plus-circle mr-2" />
                                    Add brand
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
                                    <thead className="">{HelperTool.generateTableHeaders(INTERNAL_CONFIG.MAIN_HEADERS)}</thead>
                                    <tbody>{this.generateTableRows(brands)}</tbody>
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

export default AdminBrand;
