// @flow
// Stylesheets
import "./Auth.scss";
import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// Internal Dependencies
import { ROUTE_NAME } from "../../../routes/main.routing";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";

class Auth extends React.Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        loginForm: PropTypes.bool,
        ResetPassword: PropTypes.element
    };

    render() {
        const { register } = this.props;
        if (this.props.isLoggedIn) {
            return <Redirect to={ROUTE_NAME.HOME} />;
        }

        if (this.props.resetForm) {
            return <ResetPassword {...this.props} />;
        }
        return this.props.loginForm ? <Login {...this.props} /> : <Register {...this.props} register={register} />;
    }
}

export default Auth;
