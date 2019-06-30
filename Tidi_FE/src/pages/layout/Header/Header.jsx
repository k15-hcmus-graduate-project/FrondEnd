// @flow
import React, { Component } from "react";
import _ from "lodash";
import { Formik } from "formik";
import { Link, Redirect, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import toaster from "toasted-notes";
import "./Header.scss";
import { USER_TYPE } from "../../../config/constants";
import { ROUTE_NAME } from "../../../routes/main.routing";
import AuthService from "../../../services/AuthService";
import WebService from "../../../services/WebService";
import { QUERY_PARAMS, ACTIVE_TYPE } from "../../../config/constants";
import { Parse, client } from "../../../helpers/parse";

const INITIAL_STATE = {
    openDropdownMenu: false,
    openMegaMenu: false,
    openMenuMobile: false,
    openCatalogDetail: false,
    activeMenuitemIndex: 0,
    redirectTo: null
};

const INTERNAL_CONFIG = {
    emailNotification: "Please verify your email for better experience at TIDI",
    emailNotificationSuccess: "Your email is verified!",
    emailNotificationFailure: "Verification code is invalid, please try again later"
};

class Header extends Component {
    subscription;

    static propTypes = {
        fetchIndustries: PropTypes.func,
        changeIndustryHover: PropTypes.func,
        changeLoginStatus: PropTypes.func,
        currentIndustry: PropTypes.shape({
            branches: PropTypes.array
        }),
        industries: PropTypes.array,
        isLoggedIn: PropTypes.bool,
        username: PropTypes.string
    };

    constructor(props: any) {
        super(props);
        this.state = INITIAL_STATE;
    }
    componentDidMount = async () => {
        const { changeLoginStatus, history, toggleNotification, username, permission } = this.props;
        const params = new URLSearchParams(history.location.search);
        const emailVerificationCode = params.get("email");

        this.fetchIndustries();
        AuthService.isLoggedIn().then(async status => {
            if (status.tokenIsValid) {
                // const { username } = this.props;
                var parseQuery = new Parse.Query("orders");

                this.subscription = client.subscribe(parseQuery);
                this.subscription.on("update", object => {
                    console.log("order update: ", object.get("username"));
                    if (object.get("username") === username) {
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
                                                console.log("id parse: ", object.get("id"));
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

                // Listen update product by another admin
                if (permission === USER_TYPE.ADMIN) {
                    let parseQueryPro = new Parse.Query("product");
                    let subscriptionPro = client.subscribe(parseQueryPro); //
                    subscriptionPro.on("update", object => {
                        if (object.get("updated_by") !== username) {
                            if (object.get("update") === "true") {
                                object.set("update", "false");
                                object.save().then(res => {
                                    console.log("update to fasle");
                                });
                                var id = object.get("id");
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
                                                        this.setState({
                                                            redirectTo: (
                                                                <Redirect
                                                                    exact={true}
                                                                    to={{
                                                                        pathname: ROUTE_NAME.ADMIN.PRODUCTREVIEW,
                                                                        state: { id: id }
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
                                        duration: null // This notification will not automatically close
                                    }
                                );
                            }
                        }
                    });
                }

                changeLoginStatus(status.tokenIsValid);
                if (status.emailIsVerified === ACTIVE_TYPE.FALSE && !emailVerificationCode) {
                    toggleNotification(INTERNAL_CONFIG.emailNotification, "alert-warning");
                }
            }
        });
        if (emailVerificationCode) {
            WebService.verifyEmail(emailVerificationCode).then(res => {
                const result = JSON.parse(res);
                if (result.status === ACTIVE_TYPE.TRUE) {
                    toggleNotification(INTERNAL_CONFIG.emailNotificationSuccess, "alert-success");
                } else {
                    toggleNotification(INTERNAL_CONFIG.emailNotificationFailure, "alert-danger");
                }
            });
        }
    };

    componentWillReceiveProps = (newProps, oldProps) => {
        if (newProps.emailIsVerified !== oldProps.emailIsVerified && newProps.emailIsVerified === ACTIVE_TYPE.TRUE) {
            this.props.toggleNotification("", "");
        }
    };

    fetchIndustries = () => {
        WebService.getAllIndustries().then(idtrs => {
            let industries = JSON.parse(idtrs).industry;
            this.props.fetchIndustries(industries);
            this.props.changeIndustryHover(industries[0]);
        });
    };

    toggleMenuMobile = open => {
        this.setState({
            openMenuMobile: open !== undefined ? open : !this.state.openMenuMobile
        });
    };

    handleLogout = () => {
        AuthService.logout();
        this.props.changeLoginStatus(false);
        this.setState({
            redirectTo: <Redirect to={ROUTE_NAME.LOGIN} />
        });
    };

    handleHoverMenuItem = industry => {
        this.props.changeIndustryHover(industry);
    };

    generateCatalog = () => {
        const generateCategories = categories => {
            let R = [];
            if (categories) {
                categories.forEach((cat, index) => {
                    R.push(
                        <Link className="category-item" key={index} to={`/products?cat=${cat.id}`}>
                            {cat.category_name}
                        </Link>
                    );
                });
            }

            return R;
        };

        const generateBranches = branches => {
            let R = [];
            if (branches) {
                branches.forEach((branch, index) => {
                    R.push(
                        <div key={index} className="branch-container">
                            <h6>
                                <Link className="btn-link" to={`${ROUTE_NAME.PRODUCTS}?${QUERY_PARAMS.branchId}=${branch.id}`}>
                                    {branch.branch_name}
                                </Link>
                            </h6>
                            <div>{generateCategories(branch.categories)}</div>
                        </div>
                    );
                });
            }

            return R;
        };
        return generateBranches(this.props.currentIndustry.branches);
    };

    generateMenuItems = () => {
        let R = [];
        const { industries } = this.props;
        if (industries) {
            _.map(industries, (industry, index) => {
                R.push(
                    <Link
                        key={index}
                        to={ROUTE_NAME.PRODUCTS + `?${QUERY_PARAMS.industryId}=${industry.id}`}
                        className={"dropdown-item" + (this.state.activeMenuitemIndex === index ? " menuitem-active" : "")}
                        onMouseEnter={() => {
                            this.setState({
                                activeMenuitemIndex: index
                            });
                            this.handleHoverMenuItem(industry);
                        }}
                    >
                        {industry.industry_name}
                    </Link>
                );
            });
        }

        return R;
    };

    render = () => {
        const { history, nCartItems, isLoggedIn, username, notificationMessage, notificationType } = this.props;
        const { redirectTo, openMenuMobile } = this.state;
        return (
            <header className="header_area">
                {redirectTo}
                <div className="classy-nav-container breakpoint-off d-flex align-items-center justify-content-between">
                    {/* <!-- Classy Menu --> */}
                    <nav className="classy-navbar" id="essenceNav">
                        {/* <!-- Logo --> */}
                        <Link className="nav-brand" to={ROUTE_NAME.HOME}>
                            <img src="/img/core-img/logo.png" alt="TIDI" />
                        </Link>
                        {/* <!-- Navbar Toggler --> */}
                        <div
                            className="classy-navbar-toggler"
                            onClick={() => {
                                this.toggleMenuMobile();
                            }}
                        >
                            <span className="navbarToggler">
                                <span />
                                <span />
                                <span />
                            </span>
                        </div>
                        {/* <!-- Menu --> */}
                        <div className={"classy-menu " + (openMenuMobile ? "menu-on" : "")}>
                            {/* <!-- close btn --> */}
                            <div
                                className="classycloseIcon"
                                onClick={() => {
                                    this.toggleMenuMobile();
                                }}
                            >
                                <div className="cross-wrap">
                                    <span className="top" />
                                    <span className="bottom" />
                                </div>
                            </div>
                            {/* <!-- Nav Start --> */}
                            <div className="classynav">
                                <ul>
                                    <li id="menuitem-catalog">
                                        <Link to={ROUTE_NAME.PRODUCTS}>Catalog</Link>
                                        <div className="catalog-container dropdown d-flex">
                                            <div className="menuitem-container">{this.generateMenuItems()}</div>
                                            {/* BRAND DETAIL */}
                                            <div className="catalog-detail">{this.generateCatalog()}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <Link
                                            to={{
                                                pathname: ROUTE_NAME.ADMIN.HOME,
                                                search: ""
                                            }}
                                        >
                                            Admin
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={{
                                                pathname: ROUTE_NAME.ORDERS,
                                                search: ""
                                            }}
                                        >
                                            Orders
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* <!-- Nav End --> */}
                        </div>
                    </nav>
                    {/* <!-- Header Meta Data --> */}
                    <div className="header-meta d-flex clearfix justify-content-end">
                        {/* <!-- Search Area --> */}
                        <div className="search-area">
                            <Formik
                                initialValues={{ keyword: "" }}
                                onSubmit={(values, actions) => {
                                    setTimeout(() => {
                                        history.push(ROUTE_NAME.PRODUCTS + `?${QUERY_PARAMS.keyword}=${values.keyword}`);
                                        actions.setSubmitting(false);
                                    }, 600);
                                }}
                                render={props => (
                                    <form onSubmit={props.handleSubmit}>
                                        <input
                                            type="search"
                                            value={props.values.keyword}
                                            onChange={props.handleChange}
                                            name="keyword"
                                            placeholder="Type for search"
                                        />
                                        <button type="submit">
                                            <i className="fa fa-search" aria-hidden="true" />
                                        </button>
                                    </form>
                                )}
                            />
                        </div>
                        {/* <!-- Cart Area --> */}
                        <div className="cart-area">
                            <div
                                id="essenceCartBtn"
                                onClick={() => {
                                    this.props.toggleCart(true);
                                }}
                            >
                                <img src="/img/core-img/bag.svg" alt="" /> <span>{nCartItems}</span>
                            </div>
                        </div>
                        {/* <!-- Favourite Area --> */}
                        {isLoggedIn ? (
                            <div className="favourite-area">
                                <a href="/">
                                    <img src="/img/core-img/message.svg" alt="" />
                                </a>
                            </div>
                        ) : null}
                        {/* <!-- User Login Info --> */}
                        <div className="user-login-info d-flex justify-content-center align-items-center">
                            {isLoggedIn ? (
                                <div className="favourite-area">
                                    <a href="/" className="dropdown dropdown-toggle loggedin-btn" data-toggle="dropdown">
                                        <img src="/img/core-img/user.svg" alt="" />
                                    </a>
                                    <div className="dropdown-menu">
                                        <span className="d-flex justify-content-center">Hello, {username}</span>
                                        <div className="dropdown-divider" />
                                        <Link to={ROUTE_NAME.ORDERS} className="dropdown-item text-center">
                                            My Orders
                                        </Link>
                                        <button className="dropdown-item text-center">Settings</button>
                                        <button className="dropdown-item text-center">Help</button>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item text-center" onClick={() => this.handleLogout()}>
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="user-login-button d-flex">
                                    <Link to={ROUTE_NAME.LOGIN} className="btn btn-outline-secondary text-center">
                                        Login
                                    </Link>
                                    <Link to={ROUTE_NAME.REGISTER} className="btn btn-outline-secondary">
                                        Register
                                    </Link>
                                </div>
                            )}{" "}
                            {/* <Link to={ROUTE_NAME.MAP_DIRECTION} className="btn btn-outline-secondary">
                                To Store
                            </Link> */}
                        </div>
                    </div>
                </div>
                {notificationMessage && (
                    <div className={"alert alert-dismissible fade show " + notificationType} role="alert">
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {notificationMessage}
                    </div>
                )}
            </header>
        );
    };
}

export default withRouter(Header);
