// Stylsheet
import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./AdminProduct.scss";
import { ROUTE_NAME } from "../../../routes/main.routing";
import WebService from "../../../services/WebService";
import HelperTool from "../../../helpers/lib";
import { ACTIVE_TYPE } from "../../../config/constants";

const INTIAL_STATE = {
    product: null
};

const INTERNAL_CONFIG = {
    HEADING_NAME: "Product Review",
    SEARCH_DELAY_DURATION: 300,
    MAIN_HEADERS: [
        "ID",
        "Product Name",
        "Price",
        "Total Amount",
        "Stock",
        "New Amount ",
        "Brand",
        "Category",
        "Active",
        "Sold",
        "Last Updated",
        "Updated By"
    ],
    DETAIL_HEADERS: ["Images", "Description"]
};

type State = {
    product: object
};

class AdminProductReview extends Component<State> {
    static propTypes = {
        currentPage: PropTypes.number,
        pageSize: PropTypes.number
    };

    constructor(props: any) {
        super(props);
        this.orignalBranches = [];
        this.originalCategories = [];
        this.state = INTIAL_STATE;
    }

    componentWillMount = () => {};

    componentDidMount = () => {
        const { id } = this.props.location.state;
        if (id)
            WebService.getProduct(id)
                .then(res => {
                    const product = JSON.parse(res);
                    this.setState({ product: product });
                })
                .catch(err => {
                    console.log("cannot get product: ", err);
                });
    };

    generateTableRows = product => {
        let r = [];
        r.push(
            <Fragment key={product.id}>
                <tr>
                    <td>{product.id}</td>
                    <td>{product.product_name}</td>
                    <td>{HelperTool.withCommas(product.price)} ₫</td>
                    <td>{product.amount}</td>
                    <td>{product.stock}</td>
                    <td>{product.new_amount}</td>
                    <td>{product.brand[0].brand_name}</td>
                    <td>{`${product.category[0].category_name}, ${product.branch[0].branch_name}, ${
                        product.industry[0].industry_name
                    }`}</td>
                    <td>{product.active === ACTIVE_TYPE.TRUE ? <i className="fa fa-check" /> : <i className="fa fa-times-circle" />}</td>
                    <td>{product.sold}</td>
                    <td>{product.last_updated}</td>
                    <td>{product.updated_by}</td>
                </tr>
            </Fragment>
        );

        return r;
    };
    render = () => {
        const { product } = this.state;
        if (!product) return "";
        return (
            <div className="container-fluid">
                <h2>{INTERNAL_CONFIG.HEADING_NAME}</h2>
                <hr />
                <div className="card">
                    <div className="card-body">
                        <div className="table-container" style={{ position: "relative" }}>
                            <div className="table-container table-responsive">
                                <table className="table table-hover table-sm table-bordered">
                                    <thead>{HelperTool.generateTableHeaders(INTERNAL_CONFIG.MAIN_HEADERS)}</thead>
                                    <tbody>{this.generateTableRows(product)}</tbody>
                                </table>{" "}
                                <Link to={{ pathname: ROUTE_NAME.ADMIN.PRODUCT }}>
                                    <button
                                        className="btn btn-info btn-sm"
                                        type="button"
                                        aria-expanded="false"
                                        aria-controls="collapseExample"
                                    >
                                        <i className="fa fa-info-circle" /> Manage Product
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default AdminProductReview;
