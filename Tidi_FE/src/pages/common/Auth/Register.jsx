// @flow
// External Dependencies
import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Input, Label } from "reactstrap";
import * as Yup from "yup";
import { Formik, ErrorMessage } from "formik";
import Moment from "moment";
// Internal Dependencies
import { ROUTE_NAME } from "../../../routes/main.routing";
import AuthService from "../../../services/AuthService";
import WebService from "../../../services/WebService";
import CONSTANT from "../../../config/constants";

type State = { redirectTo: Object, message: string };

const SignupSchema = Yup.object().shape({
    username: Yup.string()
        .max(20, "Tên đăng nhập chứa 1-20 ký tự")
        .required("Không bỏ qua trường này!"),
    password: Yup.string()
        .max(20, "Mật khẩu quá dài")
        .required("Không bỏ qua trường này!"),
    passwordConf: Yup.string().required("Không bỏ qua trường này!"),
    name: Yup.string().required("Không bỏ qua trường này"),
    dob: Yup.string().required("Không bỏ qua trường này"),
    email: Yup.string()
        .email("Địa chỉ mail không đúng định dạng. dạng đúng là id@domain.com")
        .required("Không bỏ qua trường này")
});
class Register extends Component<State> {
    constructor(props) {
        super(props);
        this.state = {
            redirectTo: null,
            message: ""
        };
    }

    render() {
        const initValues = {
            username: "",
            password: "",
            passwordConf: "",
            name: "",
            email: "",
            phone: null, // FIXME: change to type string
            dob: "",
            gender: null,
            address: "",
            avatar: ""
        };
        const styleErr = {
            color: "red",
            marginLeft: "20px"
        };
        console.log(this.props.authActions);

        return (
            <div className="limiter">
                {this.state.redirectTo}
                <div className="container-login100">
                    <div className="wrap-login100">
                        <div className="login100-pic js-tilt" data-tilt>
                            <img src="/img/img-01.png" alt="IMG" />
                        </div>
                        <Formik
                            initialValues={initValues}
                            validationSchema={SignupSchema}
                            onSubmit={(values, actions) => {
                                console.log(
                                    Moment(values.dob)
                                        .format(CONSTANT.DATE_FORMAT)
                                        .toString()
                                );
                                const { username, password, email, name, dob, phone, gender, address, avatar } = values;
                                setTimeout(() => {
                                    // WebService.register(username, password, email, name, dob, phone, gender, address, avatar);
                                    this.props.register(username, password, email, name, dob, phone, gender, address, avatar);
                                    actions.setSubmitting(false);
                                }, 1000);
                            }}
                            render={props => (
                                <form className="login100-form" onSubmit={props.handleSubmit}>
                                    <Label className="login100-form-title">Member Registration</Label>
                                    {/* Username */}
                                    <div className="wrap-input100 validate-input">
                                        <Input
                                            className={"input100"}
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-user" aria-hidden="true" />
                                        </span>{" "}
                                        <ErrorMessage name="username">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>

                                    {/* Password */}
                                    <div className="wrap-input100 validate-input">
                                        <Input
                                            className={"input100"}
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-lock" aria-hidden="true" />
                                        </span>
                                        <ErrorMessage name="password">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>
                                    {/* Confirm password */}
                                    <div className="wrap-input100 validate-input">
                                        <Input
                                            className="input100"
                                            type="password"
                                            name="passwordConf"
                                            placeholder="Confirm Password"
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-lock" aria-hidden="true" />
                                        </span>
                                        <ErrorMessage name="passwordConf">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                        {props.values.password !== props.values.passwordConf && (
                                            <div style={styleErr} className="errormess">
                                                Mật khẩu xác nhận không đúng
                                            </div>
                                        )}
                                    </div>
                                    {/* Email */}
                                    <div className="wrap-input100 validate-input" data-validate="Valid email is required: ex@abc.xyz">
                                        <Input
                                            className={"input100"}
                                            type="email"
                                            name="email"
                                            placeholder="Email address"
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-envelope" aria-hidden="true" />
                                        </span>
                                        <ErrorMessage name="email">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>
                                    {/* Name */}
                                    <div className="wrap-input100 validate-input" data-validate="Password is required">
                                        <Input
                                            className="input100"
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-address-card" aria-hidden="true" />
                                        </span>
                                        <ErrorMessage name="name">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>

                                    {/* DOB */}
                                    <div className="wrap-input100 validate-input" data-validate="Password is required">
                                        <Input
                                            className="input100"
                                            type="date"
                                            name="dob"
                                            placeholder="Date of Birth"
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                        <span className="focus-input100" />
                                        <span className="symbol-input100">
                                            <i className="fa fa-address-card" aria-hidden="true" />
                                        </span>
                                        <ErrorMessage name="dob">
                                            {msg => (
                                                <div style={styleErr} className="errormess">
                                                    {msg}
                                                </div>
                                            )}
                                        </ErrorMessage>
                                    </div>

                                    <div className="container-login100-form-btn">
                                        <button
                                            disabled={props.values.password !== props.values.passwordConf}
                                            type="submit"
                                            className="login100-form-btn"
                                        >
                                            Register
                                        </button>
                                    </div>

                                    <div className="text-center p-t-12">
                                        <span className="txt1">Forgot </span>
                                        <Link to={ROUTE_NAME.RESET_PASSWORD} className="txt2">
                                            Username / Password?
                                        </Link>
                                    </div>

                                    <div className="text-center p-t-136">
                                        <span className="txt1">Already have an account? </span>
                                        <Link to={ROUTE_NAME.LOGIN} className="txt2">
                                            Login
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

export default Register;
