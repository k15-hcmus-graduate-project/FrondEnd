// External Dependencies
import React, { Component } from "react";
import * as Yup from "yup";
import { Link, Redirect } from "react-router-dom";
import { Formik, ErrorMessage } from "formik";
import { Input, Label, Alert } from "reactstrap";
import PropTypes from "prop-types";
import { ROUTE_NAME } from "../../../routes/main.routing";
import AuthService from "../../../services/AuthService";

const INITIAL_STATE = {
    redirectTo: null,
    message: ""
};

const SignupSchema = Yup.object().shape({
    username: Yup.string()
        .max(20, "Tên đăng nhập chứa 1-20 ký tự")
        .required("Không bỏ qua trường này!"),
    password: Yup.string()
        .max(20, "Mật khẩu quá dài")
        .required("Không bỏ qua trường này!")
});
class Login extends Component {
    static propTypes = {
        changeLoginStatus: PropTypes.func
    };

    constructor(props: any) {
        super(props);
        this.state = INITIAL_STATE;
    }

    render() {
        const initValues = {
            username: "",
            password: ""
        };
        const styleErr = {
            color: "red",
            marginLeft: "20px"
        };
        return (
            <div className="limiter">
                {this.state.redirectTo}
                <div className="container-login100">
                    <div className="wrap-login100">
                        <div className="login100-pic js-tilt" data-tilt>
                            <img src="/img/img-01.png" alt="IMG" />
                        </div>
                        <Formik
                            initialValues={{ name: "jared" }}
                            validationSchema={SignupSchema}
                            onSubmit={(values, actions) => {
                                const { username, password } = values;
                                setTimeout(() => {
                                    AuthService.login(username, password).then(loggedInSuccess => {
                                        console.log(loggedInSuccess);
                                        if (loggedInSuccess === true) {
                                            this.props.changeLoginStatus(true);
                                            this.setState({
                                                redirectTo: <Redirect to={ROUTE_NAME.HOME} />
                                            });
                                        } else {
                                            this.setState({
                                                message: "Username or password is incorrect"
                                            });
                                        }
                                    });
                                    actions.setSubmitting(false);
                                }, 1000);
                            }}
                            render={props => (
                                <form onSubmit={props.handleSubmit} className="login100-form validate-form">
                                    <span className="login100-form-title">Member Login</span>

                                    <div className="wrap-input100 validate-input">
                                        <Input
                                            className="input100"
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            onChange={props.handleChange}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-envelope" aria-hidden="true" />
                                        </span>{" "}
                                        <ErrorMessage name="username">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>

                                    <div className="wrap-input100 validate-input">
                                        <input
                                            className="input100"
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            onChange={props.handleChange}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-lock" aria-hidden="true" />
                                        </span>{" "}
                                        <ErrorMessage name="password">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>

                                    <div className="d-flex justify-content-center" style={{ color: "red", height: 20, margin: 0 }}>
                                        {" " + this.state.message}
                                    </div>

                                    <div className="container-login100-form-btn">
                                        <button type="submit" className="login100-form-btn">
                                            Login
                                        </button>
                                    </div>

                                    <div className="text-center p-t-12">
                                        <span className="txt1">Forgot </span>
                                        <Link to={ROUTE_NAME.RESET_PASSWORD} className="txt2">
                                            Username / Password?
                                        </Link>
                                    </div>

                                    <div className="text-center p-t-136">
                                        <Link to={ROUTE_NAME.REGISTER} className="txt2">
                                            Create your Account
                                            <i className="fa fa-long-arrow-right m-l-5" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </form>
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
