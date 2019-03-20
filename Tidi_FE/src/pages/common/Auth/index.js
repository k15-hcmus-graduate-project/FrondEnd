// @flow
import React, { Component } from "react";
import { Redirect, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Actions from "../duck/actions";
import * as AuthActions from "../duck/actions";
import "./Auth.scss";
import { ROUTE_NAME } from "../../../routes/main.routing";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";

type Props = { isLoggedIn: boolean, loginForm: boolean, ResetPassword: Object };
class Auth extends Component<Props> {
    componentWillMount = () => {};
    render() {
        console.log(this.props);
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

const mapStateToProps = state => {
    const { Auth } = state.common;
    return { Auth };
};

function mapDispatchToProps(dispatch) {
    return {
        register: bindActionCreators(AuthActions.register, dispatch),
        changeLoginStatus: bindActionCreators(Actions.updateAuthStatus, dispatch)
    };
}
// const mapDispatchToProps = dispatch => ({
//     changeLoginStatus: status => {
//         dispatch(
//             Actions.updateAuthStatus({
//                 isLoggedIn: status
//             })
//         );
//     },
//     register: (username, password, email, fullName, dateOfBirth, phone, gender, address, avatar) => {
//         dispatch(
//             Actions.register({
//                 username,
//                 password,
//                 email,
//                 fullName,
//                 dateOfBirth,
//                 phone,
//                 gender,
//                 address,
//                 avatar
//             })
//         );
//     }
// });

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Auth)
);
