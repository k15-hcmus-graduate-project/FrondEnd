// Stylsheet
import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import "./AdminOrder.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import HelperTool, { withCommas, showAlert } from "../../../helpers/lib";
import { ORDER_STATUS, ACTIVE_TYPE } from "../../../config/constants";
import Paginator from "../../common/Paginator";
import FormInput from "../../common/FormInput";

const INTIAL_STATE = {
    showLoadingBar: false,
    message: null,
    orders: []
};

const INTERNAL_CONFIG = {
    HEADING_NAME: "Order",
    SEARCH_DELAY_DURATION: 300,
    PAGE_SIZE_ARR: [10, 25, 50, 100],
    MAIN_HEADERS: ["ID", "Username", "Date", "Total", "Status", "Actions"],
    DETAIL_HEADERS: ["Full Name", "Email", "Address", "Phone", "Note"]
};

class AdminOrder extends Component {
    static propTypes = {
        currentPage: PropTypes.number,
        pageSize: PropTypes.number,
        totalItems: PropTypes.number,
        fetchOrders: PropTypes.func,
        changePageInfo: PropTypes.func,
        query: PropTypes.shape({
            keyword: PropTypes.string
        })
    };

    orderToBlock = null;
    originalAccountInfo = {};
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
        const { history, currentPage, query } = this.props;
        const params = new URLSearchParams(history.location.search);
        const pageIndex = Number(params.get("page"));
        const pageSize = Number(params.get("size"));
        if (pageIndex && pageSize && INTERNAL_CONFIG.PAGE_SIZE_ARR.indexOf(pageSize) !== -1) {
            this.handleFilterChange({
                currentPage: pageIndex,
                pageSize: pageSize
            });
        } else {
            this.fetchOrders(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0], query);
            this.updateURLParams(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0]);
        }
    };

    updateURLParams = (currentPage, pageSize) => {
        this.props.history.push({
            search: `?size=${pageSize || this.props.pageSize}&page=${currentPage || this.props.currentPage}`
        });
    };

    componentDidMount = () => {
        this._isMounted = true;
    };

    componentWillUnmount = () => {
        this._isMounted = false;
    };

    fetchOrders = (currentPage, pageSize, query = {}) => {
        this.setState({
            showLoadingBar: true
        });

        WebService.adminGetAllOrders(AuthService.getTokenUnsafe(), pageSize, (currentPage - 1) * pageSize, query).then(res => {
            const result = JSON.parse(res);
            // this.props.fetchOrders(result.orders);
            if (result.orders && result.status === ACTIVE_TYPE.TRUE) {
                result.orders.forEach(order => {
                    // backup original order status
                    order.originalStatus = order.status;
                });
                this.setState({
                    orders: result.orders
                });

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
        });
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
            this.fetchOrders(
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
        this.fetchOrders(this.props.currentPage, this.props.pageSize, this.props.query);
    };

    handleUpdateOrder = order => {
        if (order.status !== order.originalStatus) {
            WebService.admimChangeOrderStatus(AuthService.getTokenUnsafe(), order.id, order.status).then(res => {
                const result = JSON.parse(res);
                if (result.status === ACTIVE_TYPE.TRUE) {
                    this.fetchOrders(this.props.currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0], this.props.query);
                }
            });
        }
    };

    generateTableRows = orders => {
        let r = [];

        orders.forEach((order, id) => {
            r.push(
                <Fragment key={id}>
                    <tr>
                        <td>{order.id}</td>
                        <td>{order.user.username}</td>
                        <td>{order.date}</td>
                        <td>{withCommas(order.total)} ₫</td>
                        <td>
                            <FormInput
                                type="select"
                                value={order.status}
                                options={[
                                    ORDER_STATUS.CHECKED,
                                    ORDER_STATUS.PACKING,
                                    ORDER_STATUS.SHIPPING,
                                    ORDER_STATUS.SUCCESSFUL,
                                    ORDER_STATUS.CANCELED,
                                    ORDER_STATUS.PAID,
                                    ORDER_STATUS.PENDING
                                ]}
                                onChangeHandler={e => {
                                    order.status = e.target.value;
                                    this.forceUpdate();
                                }}
                                additionalClass={order.status === order.originalStatus ? "" : "status-changed"}
                            />
                        </td>
                        <td>
                            <div className="btn-group">
                                <button
                                    className="btn btn-info btn-sm"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target={"#detailbox" + order.id}
                                    aria-expanded="false"
                                    aria-controls="collapseExample"
                                >
                                    <i className="fa fa-info-circle" /> Detail
                                </button>
                                <button className="btn btn-warning btn-sm" type="button" onClick={() => this.handleUpdateOrder(order)}>
                                    <i className="fa fa-edit" /> Update
                                </button>
                            </div>
                        </td>
                    </tr>

                    {/* ROW DETAIL */}
                    <tr className="collapse no-hover" id={"detailbox" + order.id}>
                        <td colSpan={INTERNAL_CONFIG.MAIN_HEADERS.length}>
                            <div className="card card-body" style={{ border: "none" }}>
                                <table className="table table-sm">
                                    <thead>{HelperTool.generateTableHeaders(INTERNAL_CONFIG.DETAIL_HEADERS)}</thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <img
                                                    src={
                                                        order.avatar
                                                            ? order.avatar
                                                            : "http://bestnycacupuncturist.com/wp-content/uploads/2016/11/anonymous-avatar-sm.jpg"
                                                    }
                                                    alt="NONE"
                                                    style={{ width: 40 }}
                                                />
                                                {order.user.fullName}
                                            </td>
                                            <td>{order.user.email}</td>
                                            <td>{order.user.address}</td>
                                            <td>{order.user.phone}</td>
                                            <td>{order.user.note}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="5">
                                                {order.products.map((prd, idx) => {
                                                    return (
                                                        <div key={idx}>
                                                            [{prd.id}] {prd.product_name} ({withCommas(prd.price)}₫) - X{prd.amount}
                                                        </div>
                                                    );
                                                })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="5">
                                                {order.history.map((his, idx) => {
                                                    return (
                                                        <div key={idx}>
                                                            {[his.date]} | {his.status}
                                                        </div>
                                                    );
                                                })}
                                            </td>
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
        const { pageSize, currentPage, totalItems } = this.props;
        const { showLoadingBar, orders } = this.state;
        return (
            <div className="container-fluid">
                <h2>{INTERNAL_CONFIG.HEADING_NAME}</h2>
                <hr />
                <div className="card">
                    <div className="card-header d-flex justify-content-end" />
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
                            <div className="control-buttons btn-group justify-content-space-between" />
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>
                                Display {pageSize * currentPage > totalItems ? totalItems : pageSize * currentPage} / {totalItems}
                            </span>
                            {/* <span>{this.state.message}</span> */}
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
                                    <tbody>{this.generateTableRows(orders)}</tbody>
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

export default AdminOrder;
