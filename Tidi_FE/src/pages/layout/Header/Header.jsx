// @flow
import React from "react";
import _ from "lodash";
import { Formik } from "formik";
import { Link, Redirect, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import "./Header.scss";
import { ROUTE_NAME } from "../../../routes/main.routing";
import AuthService from "../../../services/AuthService";
import WebService from "../../../services/WebService";
import { QUERY_PARAMS, ACTIVE_TYPE } from "../../../config/constants";

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

class Header extends React.Component {
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

    componentDidMount = () => {
        const params = new URLSearchParams(this.props.history.location.search);
        const emailVerificationCode = params.get("email");

        this.fetchIndustries();
        // FIXME: retrieve isLoggedIn from RouteWithSubRoutes and delete this block
        // Authentication verifying procedure
        // ============ START
        AuthService.isLoggedIn().then(status => {
            console.log(status);
            if (status.tokenIsValid) {
                this.props.changeLoginStatus(status.tokenIsValid);

                if (status.emailIsVerified === ACTIVE_TYPE.FALSE && !emailVerificationCode) {
                    this.props.toggleNotification(INTERNAL_CONFIG.emailNotification, "alert-warning");
                }
            }
        });
        // ============ END

        // Get email verification code from URL
        if (emailVerificationCode) {
            WebService.verifyEmail(emailVerificationCode).then(res => {
                const result = JSON.parse(res);

                if (result.status === ACTIVE_TYPE.TRUE) {
                    this.props.toggleNotification(INTERNAL_CONFIG.emailNotificationSuccess, "alert-success");
                } else {
                    this.props.toggleNotification(INTERNAL_CONFIG.emailNotificationFailure, "alert-danger");
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

    render() {
        console.log(this.props.nCartItems);
        return (
            <header className="header_area">
                {this.state.redirectTo}
                <div className="classy-nav-container breakpoint-off d-flex align-items-center justify-content-between">
                    {/* <!-- Classy Menu --> */}
                    <nav className="classy-navbar" id="essenceNav">
                        {/* <!-- Logo --> */}
                        <Link className="nav-brand" to={ROUTE_NAME.HOME}>
                            <img src="/img/core-img/logo.png" alt="" />
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
                        <div className={"classy-menu " + (this.state.openMenuMobile ? "menu-on" : "")}>
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
                                        this.props.history.push(ROUTE_NAME.PRODUCTS + `?${QUERY_PARAMS.keyword}=${values.keyword}`);
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
                                <img src="/img/core-img/bag.svg" alt="" /> <span>{this.props.nCartItems}</span>
                            </div>
                        </div>
                        {/* <!-- Favourite Area --> */}
                        {this.props.isLoggedIn ? (
                            <div className="favourite-area">
                                <a href="/">
                                    <img src="/img/core-img/message.svg" alt="" />
                                </a>
                            </div>
                        ) : null}
                        {/* <!-- User Login Info --> */}
                        <div className="user-login-info d-flex justify-content-center align-items-center">
                            {this.props.isLoggedIn ? (
                                <div className="favourite-area">
                                    <a href="/" className="dropdown dropdown-toggle loggedin-btn" data-toggle="dropdown">
                                        <img src="/img/core-img/user.svg" alt="" />
                                    </a>
                                    <div className="dropdown-menu">
                                        <span className="d-flex justify-content-center">Hello, {this.props.username}</span>
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
                            )}
                        </div>
                    </div>
                </div>
                {this.props.notificationMessage && (
                    <div className={"alert alert-dismissible fade show " + this.props.notificationType} role="alert">
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {this.props.notificationMessage}
                    </div>
                )}
            </header>
        );
    }
}

export default withRouter(Header);
