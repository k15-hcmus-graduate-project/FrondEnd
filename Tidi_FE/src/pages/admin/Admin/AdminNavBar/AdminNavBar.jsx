// Stylesheet
import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import "./AdminNavBar.scss";
import { USER_TYPE } from "../../../../config/constants";
import toaster from "toasted-notes";
import "toasted-notes/src/styles.css"; // optional styles
import AuthService from "../../../../services/AuthService";
import { ROUTE_NAME } from "../../../../routes/main.routing";
import { Parse, client } from "../../../../helpers/parse";

const INTIAL_STATE = {
    redirectTo: null
};

class AdminNavBar extends Component {
    subscription;

    static propTypes = {
        username: PropTypes.string
    };

    constructor(props: any) {
        super(props);
        this.state = INTIAL_STATE;
    }
    componentWillMount = () => {
        var verify = AuthService.verifyTokenAdmin();
        if (!verify) {
            this.logout();
        }
    };

    componentDidMount = () => {
        // console.log("did mount : ", this.props);
        const { username, permission } = this.props;
        let parseQuery = new Parse.Query("product");
        this.subscription = client.subscribe(parseQuery); // subcribe client parse

        this.subscription.on("update", object => {
            if (username && object.get("updated_by") !== username && permission === USER_TYPE.ADMIN) {
                if (object.get("update") === "true") {
                    object.set("update", "false");
                    object.save().then(res => {
                        console.log("update to fasle");
                    });
                    console.log("update product admin on parse: ", object);
                    toaster.notify(
                        ({ onClose }) => (
                            <div className="customNotic">
                                <span style={{ fontSize: "20px" }}>
                                    Product &#160;
                                    <strong style={{ color: "red" }}>
                                        {object.get("id")} - {object.get("product_name")}
                                    </strong>
                                    <br />
                                    has been updated by <strong style={{ color: "red" }}>{object.get("updated_by")}! </strong>
                                </span>
                                <br />
                                <div style={{ testAlign: "center" }}>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => {
                                            console.log("id parse: ", object.get("id"));
                                            this.setState({
                                                redirectTo: (
                                                    <Redirect
                                                        to={{ pathname: ROUTE_NAME.ADMIN.PRODUCTREVIEW, state: { id: object.get("id") } }}
                                                    />
                                                )
                                            });
                                        }}
                                    >
                                        Check Product
                                    </button>
                                    &#160;&#160;
                                    <button className="btn btn-warning" onClick={onClose}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        ),
                        {
                            position: "bottom-right", // top-left, top, top-right, bottom-left, bottom, bottom-right
                            duration: null // This notification will not automatically close
                        }
                    );
                }
            }
        });

        // listen order

        var parseQueryOrder = new Parse.Query("orders");

        let subscriptionOrder = client.subscribe(parseQueryOrder);
        subscriptionOrder.on("update", object => {
            console.log("order update: ", object.get("username"));
            if (object.get("username") === this.props.username) {
                toaster.notify(
                    ({ onClose }) => (
                        <div className="customNotic">
                            <span style={{ fontSize: "20px" }}>
                                Your order &#160;
                                <strong style={{ color: "red" }}>{object.get("uid")}</strong>
                                <br />
                                has been updated!!
                            </span>
                            <br />
                            <div style={{ testAlign: "center" }}>
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        this.setState({
                                            redirectTo: (
                                                <Redirect
                                                    to={{
                                                        pathname: `${ROUTE_NAME.ORDER_DETAIL}/${object.get("uid")}`,
                                                        state: { id: object.get("id") }
                                                    }}
                                                />
                                            )
                                        });
                                    }}
                                >
                                    Check Product
                                </button>
                                &#160;&#160;
                                <button className="btn btn-warning" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    ),
                    {
                        position: "bottom-right", // top-left, top, top-right, bottom-left, bottom, bottom-right
                        duration: 6000 // This notification will not automatically close
                    }
                );
            }
        });
    };

    componentWillUnmount = () => {
        client.unsubscribe(this.subscription);
    };

    logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshTokenToken");
        this.setState({
            redirectTo: <Redirect to={ROUTE_NAME.LOGIN} />
        });
    };

    render = () => {
        const { username, location } = this.props;
        const { redirectTo } = this.state;
        return (
            <div className="nav-side-menu">
                {redirectTo}
                <h1 className="brand">
                    <Link to={ROUTE_NAME.ADMIN.HOME}>ADMIN</Link>
                    <small>
                        <Link to={ROUTE_NAME.HOME}> TIDI</Link>
                    </small>
                </h1>
                <p className="text-center">
                    Hello, <strong>{username}</strong>
                </p>
                <p className="text-center">
                    <button onClick={() => this.logout()}>Logout</button>
                </p>
                <i className="fa fa-bars fa-2x toggle-btn" data-toggle="collapse" data-target="#menu-content" />
                <div className="menu-list">
                    <ul id="menu-content" className="menu-content collapse out">
                        <li>
                            <a href="/">
                                <i className="fa fa-dashboard fa-lg" /> Dashboard
                            </a>
                        </li>
                        <li data-toggle="collapse" data-target="#products" className="show active">
                            <a href="/">
                                <i className="fa fa-briefcase fa-lg" /> Management <span className="arrow" />
                            </a>
                        </li>
                        <ul className="sub-menu collapse show" id="products">
                            <li className={location.pathname === ROUTE_NAME.ADMIN.USER ? "active" : ""}>
                                <Link to={ROUTE_NAME.ADMIN.USER}>User</Link>
                            </li>
                            <li className={location.pathname === ROUTE_NAME.ADMIN.PRODUCT ? "active" : ""}>
                                <Link to={ROUTE_NAME.ADMIN.PRODUCT}>Product</Link>
                            </li>
                            <li className={location.pathname === ROUTE_NAME.ADMIN.STORE ? "active" : ""}>
                                <Link to={ROUTE_NAME.ADMIN.STORE}>Store</Link>
                            </li>
                            <li className={location.pathname === ROUTE_NAME.ADMIN.ORDER ? "active" : ""}>
                                <Link to={ROUTE_NAME.ADMIN.ORDER}>Order</Link>
                            </li>
                            <li className={location.pathname === ROUTE_NAME.ADMIN.BRAND ? "active" : ""}>
                                <Link to={ROUTE_NAME.ADMIN.BRAND}>Brand</Link>
                            </li>
                        </ul>
                    </ul>
                </div>
            </div>
        );
    };
}

export default AdminNavBar;
