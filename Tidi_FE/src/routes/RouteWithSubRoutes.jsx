// StyleSheets
import React, { Component } from "react";
import PropTypes from "prop-types";
import AuthService from "../services/AuthService";
import { Route } from "react-router-dom";
import "./RouteWithSubRoutes.scss";
import { USER_TYPE } from "../config/constants";
import Loader from "../pages/common/Loader/Loader";

const INTIIAL_STATE = {
    tokenVerificationCompleted: false,
    isLoggedIn: false,
    permission: null,
    username: null
};

class HOC extends Component {
    static propTypes = {
        requiredPermission: PropTypes.oneOf([USER_TYPE.ADMIN, USER_TYPE.CUSTOMER, USER_TYPE.PUBLIC]),
        permission: PropTypes.oneOf([USER_TYPE.ADMIN, USER_TYPE.CUSTOMER, USER_TYPE.PUBLIC]),
        component: PropTypes.oneOfType([PropTypes.func, PropTypes.element])
    };

    constructor(props: any) {
        super(props);
        this.state = INTIIAL_STATE;
    }

    componentDidMount = () => {
        AuthService.isLoggedIn().then(res => {
            let newState = {};
            newState.tokenVerificationCompleted = true;
            if (res.tokenIsValid) {
                newState.isLoggedIn = true;
                newState.username = res.username;
                newState.permission = res.permission;
            }
            newState.isVerified = res.emailIsVerified;

            this.setState(newState);
        });
        window.scrollTo(0, 0);
    };

    render = () => {
        const { tokenVerificationCompleted, permission } = this.state;
        const { requiredPermission } = this.props;
        if (tokenVerificationCompleted) {
            if (requiredPermission === USER_TYPE.PUBLIC || permission === USER_TYPE.ADMIN || requiredPermission === permission) {
                return <this.props.component {...this.props} {...this.state} />;
            } else {
                return (
                    <div className="d-flex justify-content-center align-items-center p5">You don't have permission to access this page</div>
                );
            }
        }
        return <Loader />;
    };
}

export default route => (
    <Route
        exact={route.exact}
        path={route.path}
        render={props => <HOC requiredPermission={route.permission} component={route.component} routes={route.routes} {...props} />}
    />
);
