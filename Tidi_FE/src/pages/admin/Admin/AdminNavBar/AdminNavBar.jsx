// Stylesheet
import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import "./AdminNavBar.scss";
import AuthService from "../../../../services/AuthService";
import { ROUTE_NAME } from "../../../../routes/main.routing";
const INTIAL_STATE = {
    redirectTo: null
};

class AdminNavBar extends Component {
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
    logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshTokenToken");
        this.setState({
            redirectTo: <Redirect to={ROUTE_NAME.LOGIN} />
        });
    };

    render = () => {
        const { username, location } = this.props;
        return (
            <div className="nav-side-menu">
                {this.state.redirectTo}
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
