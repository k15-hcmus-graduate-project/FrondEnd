// Stylsheet
import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import "./AdminStore.scss";
import { Link } from "react-router-dom";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import HelperTool, { showAlert } from "../../../helpers/lib";
import { ROUTE_NAME } from "../../../routes/main.routing";
import { DEFAULT_FORMDATA, ACTIVE_TYPE } from "../../../config/constants";
import Modal from "../../common/Modal";
import AdminAddStore from "./AdminAddStore";
import Paginator from "../../common/Paginator";
import Message from "../../common/FormMessage";
// import Loader from "../../common/Loader/Loader";

const INTIAL_STATE = {
    showLoadingBar: false,
    message: null
};

const INTERNAL_CONFIG = {
    HEADING_NAME: "Stores",
    SEARCH_DELAY_DURATION: 300,
    PAGE_SIZE_ARR: [10, 25, 50, 100],
    MAIN_HEADERS: ["ID", "Product Name", "Stores ", "Actions"],
    DETAIL_HEADERS: ["Images", "Description"]
};
type State = {
    showLoadingBar: boolean,
    message: Object
};

class AdminStore extends Component<State> {
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

    stores = [];
    originalProductInfo = {};
    searchInterval = null;
    _isMounted = false;

    constructor(props: any) {
        super(props);
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
        this.fetchStores();
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
                    console.log("data products: ", result.products);
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

    fetchStores = () => {
        WebService.getAllAddress(AuthService.getTokenUnsafe())
            .then(res => {
                const result = JSON.parse(res);
                if (result.status === ACTIVE_TYPE.TRUE && result.stores) {
                    console.log("data stores: ", result.stores);
                    this.stores = result.stores;
                } else {
                    showAlert(result.message, "error");
                }
            })
            .catch(err => {
                console.log("Have error when get admin products.", err);
            });
    };
    prepareFormData = data => {
        this.setState({
            message: null
        });
        for (let attr in data) {
            if (!(attr in DEFAULT_FORMDATA.AdminAddStore) && data[attr]) {
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

        this.props.setFormData(DEFAULT_FORMDATA.AdminAddStore);
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

    handleUpdateStore = () => {
        const { formData, productName, currentPage, pageSize, query, username } = this.props;
        console.log("update: ", formData);
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
                var test = new Date();
                var time =
                    test.getFullYear() +
                    (test.getMonth() < 9 ? "0" + (test.getMonth() + 1) : "" + test.getMonth() + 1) +
                    (test.getDate() < 9 ? "0" + test.getDate() : test.getDate());
                newInfo.last_updated = time;

                newInfo.updated_by = username;
                WebService.adminUpdateProduct(AuthService.getTokenUnsafe(), formData.id, newInfo).then(res => {
                    const resObj = JSON.parse(res);
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

    handleAddStore = () => {
        const { formData } = this.props;

        return new Promise((resolve, reject) => {
            this.setState({
                message: <Message content="Creating store..." />
            });

            if (!formData.store_name) {
                this.setState({
                    message: <Message color="red" content="Store Name is empty" />
                });
            } else if (!formData.store_address) {
                this.setState({
                    message: <Message color="red" content="Store address is empty" />
                });
            } else {
                WebService.adminInsertStore(AuthService.getTokenUnsafe(), formData).then(res => {
                    const resObj = JSON.parse(res);
                    if (resObj.status === ACTIVE_TYPE.TRUE) {
                        this.setState({
                            message: <Message color="green" content="Create store successfully" />
                        });
                        resolve(true);
                        this.fetchStores();
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

    generateTableRows = products => {
        let r = [];
        if (!products || products.length === 0) return;
        products.forEach((product, id) => {
            let productStores;
            try {
                productStores = JSON.parse(product.store);
            } catch (e) {
                productStores = [];
            }

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
                        <td>
                            <Link to={{ pathname: ROUTE_NAME.ADMIN.PRODUCTREVIEW, state: { id: product.id } }}>{product.id}</Link>
                        </td>
                        <td>
                            <Link to={{ pathname: ROUTE_NAME.ADMIN.PRODUCTREVIEW, state: { id: product.id } }}>{product.product_name}</Link>
                        </td>
                        <td>{productStores}</td>
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
                                    data-target="#update-store-modal"
                                    onClick={() => this.prepareFormData({ ...product })}
                                >
                                    <i className="fa fa-pencil-square-o" /> Edit
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
        const { message, showLoadingBar } = this.state;
        return (
            <div className="container-fluid">
                <Modal
                    modalId="add-store-modal"
                    modalTitle="Create new Store"
                    modalBody={<AdminAddStore editMode={false} />}
                    modalHandleSubmit={this.handleAddStore}
                    modalSubmitTitle="Add"
                    modalSubmitClassName="btn-success"
                    modalMessage={message}
                />
                <Modal
                    modalId="update-store-modal"
                    modalTitle="Update store info"
                    modalBody={<AdminAddStore editMode={true} stores={this.stores} />}
                    modalHandleSubmit={this.handleUpdateStore}
                    modalSubmitTitle="Update"
                    modalSubmitClassName="btn-warning"
                    modalMessage={message}
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
                                    data-target="#add-store-modal"
                                    onClick={() => {
                                        this.clearFormData();
                                    }}
                                >
                                    <i className="fa fa-plus-circle mr-2" />
                                    Add Store
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

export default AdminStore;
