// Stylsheet
import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import "./AdminProduct.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import HelperTool, { withCommas, showAlert } from "../../../helpers/lib";
import { ACTIVE_TYPE } from "../../../config/constants";
import Paginator from "../../common/Paginator";
import Loader from "../../common/Loader/Loader";

const INTIAL_STATE = {
    showLoadingBar: false,
    message: null,
    id: -1,
    name: null,
    histories: []
};

const INTERNAL_CONFIG = {
    HEADING_NAME: "Product History",
    SEARCH_DELAY_DURATION: 300,
    PAGE_SIZE_ARR: [10, 25, 50, 100],
    MAIN_HEADERS: ["ID", "Name", "Order id", "Amount", "Price", "Store", "Created date"]
};

class AdminProductHistory extends Component {
    static propTypes = {
        totalItems: PropTypes.number,
        fetchOrders: PropTypes.func
    };

    _isMounted = false;

    constructor(props: any) {
        super(props);
        this.state = INTIAL_STATE;
    }

    componentWillMount = () => {};

    updateURLParams = (currentPage, pageSize) => {
        this.props.history.push({
            search: `?size=${pageSize || this.props.pageSize}&page=${currentPage || this.props.currentPage}`
        });
    };

    componentDidMount = () => {
        console.log("his data: ", this.props.location.state);
        const { history, currentPage } = this.props;
        const { id, name } = this.props.location.state;
        if (id !== -1) {
            this.setState({
                ...this.state,
                id: id,
                name: name
            });
            const params = new URLSearchParams(history.location.search);
            const pageIndex = Number(params.get("page"));
            const pageSize = Number(params.get("size"));
            if (pageIndex && pageSize && INTERNAL_CONFIG.PAGE_SIZE_ARR.indexOf(pageSize) !== -1) {
                this.handleFilterChange({
                    currentPage: pageIndex,
                    pageSize: pageSize
                });
            } else {
                this.fetchProductHistory(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0], id);
                this.updateURLParams(currentPage, INTERNAL_CONFIG.PAGE_SIZE_ARR[0]);
            }
        }
        this._isMounted = true;
    };

    componentWillUnmount = () => {
        this._isMounted = false;
    };

    fetchProductHistory = (currentPage, pageSize, id) => {
        this.setState({
            showLoadingBar: true
        });

        WebService.adminGetProHistory(AuthService.getTokenUnsafe(), pageSize, (currentPage - 1) * pageSize, id).then(res => {
            const result = JSON.parse(res);
            // this.props.fetchOrders(result.orders);
            if (result.history && result.status === ACTIVE_TYPE.TRUE) {
                this.setState({
                    histories: result.history.reverse()
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

    generateTableRows = histories => {
        let r = [];
        const { name } = this.state;

        histories.forEach((history, id) => {
            r.push(
                <Fragment key={id}>
                    <tr>
                        <td>{history.id}</td>
                        <td>{name}</td>
                        <td>{history.orders_id}</td>
                        <td>{history.amount}</td>
                        <td>{withCommas(history.final_price)} ₫</td>
                        <td>{history.store}</td>
                        <td>{history.created_date}</td>
                    </tr>
                </Fragment>
            );
        });
        return r;
    };

    render = () => {
        const { pageSize, currentPage, totalItems } = this.props;
        const { showLoadingBar, histories, id, name } = this.state;
        if (id === -1 || name === null) return <Loader />;
        return (
            <div className="container-fluid">
                <h2>{INTERNAL_CONFIG.HEADING_NAME}</h2>
                <hr />
                <div className="card">
                    <div className="card-header d-flex justify-content-end" />
                    <div className="card-body">
                        <div className="controllers d-flex">
                            <div className="control-buttons btn-group justify-content-space-between" />
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
                                    <tbody>{this.generateTableRows(histories)}</tbody>
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

export default AdminProductHistory;
