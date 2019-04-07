// Stylesheet
import React, { Component } from "react";
import Swal from "sweetalert2";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import "./CheckoutDetail.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import { PAYMENT_METHOD, ACTIVE_TYPE } from "../../../config/constants";
import { ROUTE_NAME } from "../../../routes/main.routing";
import LIB, { withCommas } from "../../../helpers/lib";
import FormInput from "../../common/FormInput";

const INITIAL_STATE = {
    fullName: "",
    address: "",
    phoneNumber: "",
    email: "",
    shippingNote: "",
    shippingFee: null,
    shippingMethod: {},
    couponCode: "",

    fullNameIsInvalid: false,
    shippingMethodIsInvalid: false,
    emailIsInvalid: false,
    addressIsInvalid: false,
    phoneNumberIsInvalid: false,
    errorMessage: "",
    couponMessage: "",
    couponStatusCode: null,
    couponDiscPercent: 0,
    couponMoney: 0,
    redirectTo: null
};

const INTERNAL_CONFIG = {
    INTERVAL_DURATION: 1000,
    SWAL_TIMEOUT: 10000
};

class CheckoutDetail extends Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        isSelected: PropTypes.bool,
        cartItems: PropTypes.array,
        updateCartProducts: PropTypes.func,
        handleOnSelect: PropTypes.func
    };

    constructor(props: any) {
        super(props);

        this.state = INITIAL_STATE;
        this.total = 0;
        this.discountTotal = 0;
        this.zalopayOrderId = null;
        this.zptranstoken = null;
        this.checkStatusInterval = null;
    }

    componentWillMount = () => {
        this.fetchCartProducts();
        this.fetchUserInfo();
    };

    fetchCartProducts = () => {
        const { isLoggedIn, updateCartProducts } = this.props;
        if (isLoggedIn) {
            return WebService.getCart(AuthService.getTokenUnsafe()).then(res => {
                const result = JSON.parse(res);
                if (result.status === true) {
                    if (result.products) {
                        result.products.forEach(prd => (prd.images = JSON.parse(prd.images)));
                    }
                    updateCartProducts(result.products);
                }
            });
        } else {
            return Promise.reject("Refresh cart failed");
        }
    };

    fetchUserInfo = () => {
        const { address, phoneNumber } = this.state;
        WebService.readAccountInfo(AuthService.getTokenUnsafe()).then(response => {
            let res = JSON.parse(response);
            if (res.status === true) {
                this.setState({
                    fullName: res.fullName ? res.fullName : "",
                    address: res.address ? res.address : "",
                    phoneNumber: res.phone ? res.phone : "",
                    email: res.email ? res.email : ""
                });
                if (address === "") this.setState({ addressIsInvalid: true });
                if (phoneNumber === "") this.setState({ phoneNumberIsInvalid: true });
            } else {
                this.setState({
                    redirectTo: <Redirect to={ROUTE_NAME.PRODUCTS} />
                });
            }
        });
    };

    placeOrder = () => {
        return new Promise((resolve, _reject) => {
            // console.log(this.state);
            let products = [];
            const { cartItems } = this.props;
            if (cartItems) {
                cartItems.map(item => {
                    return products.push({ proID: item.id, price: item.price, amount: item.amount });
                });
            }
            const { couponCode, fullName, phoneNumber, email, address, shippingNote, shippingMethod } = this.state;
            WebService.toCheckout(
                AuthService.getTokenUnsafe(),
                couponCode,
                fullName,
                phoneNumber,
                email,
                address,
                shippingNote,
                this.total,
                this.discountTotal,
                products,
                shippingMethod.NAME
            )
                .then(res => {
                    const result = JSON.parse(res);
                    console.log(result);
                    if (result.status === ACTIVE_TYPE.TRUE) {
                        resolve({
                            status: true,
                            payload: result
                        });
                    } else {
                        resolve({
                            status: false,
                            message: result.message,
                            payload: result
                        });
                    }
                })
                .catch(res => {
                    const result = JSON.parse(res);
                    resolve({
                        status: false,
                        message: result.message,
                        payload: result
                    });
                });
        });
    };

    handleApplyCoupon = () => {
        const { couponCode, couponStatusCode } = this.state;
        if (couponCode && couponStatusCode !== 1) {
            WebService.getCouponStatus(couponCode).then(res => {
                const result = JSON.parse(res);
                let couponMessage = "";
                switch (result.status) {
                    case -1:
                        couponMessage = "Coupon is invalid";
                        break;
                    case 0:
                        couponMessage = "Coupon is expired";
                        break;
                    case 1:
                        couponMessage = "Coupon is applied";
                        break;

                    default:
                        break;
                }

                this.setState({
                    couponMessage,
                    couponStatusCode: result.status,
                    couponDiscPercent: result.discPercent,
                    couponMoney: result.money
                });
            });
        } else if (couponStatusCode === 1) {
            this.setState({
                couponCode: INITIAL_STATE.couponCode,
                couponStatusCode: INITIAL_STATE.couponStatusCode,
                couponMessage: INITIAL_STATE.couponMessage,
                couponDiscPercent: INITIAL_STATE.couponDiscPercent,
                couponMoney: INITIAL_STATE.couponMoney
            });
        }
    };

    handleOrder = () => {
        const { shippingMethod, fullName, email, address, phoneNumber } = this.state;
        if (!shippingMethod.NAME) {
            this.setState({
                shippingMethodIsInvalid: true,
                errorMessage: "Please choose a shipping method"
            });
        } else if (!fullName) {
            this.setState({
                fullNameIsInvalid: true,
                errorMessage: "Please enter your name"
            });
        } else if (!email) {
            this.setState({
                emailIsInvalid: true,
                errorMessage: "Please enter your email"
            });
        } else if (!address) {
            this.setState({
                addressIsInvalid: true,
                errorMessage: "Please enter your address"
            });
        } else if (!phoneNumber) {
            this.setState({
                phoneNumberIsInvalid: true,
                errorMessage: "Please enter your phone number"
            });
        } else {
            Swal({
                title: "Ordering...",
                timer: INTERNAL_CONFIG.SWAL_TIMEOUT,
                allowOutsideClick: false,
                onOpen: () => {
                    Swal.showLoading();
                    this.placeOrder().then(res => {
                        if (res.status === true) {
                            // Order on AppServer successfully
                            console.log(PAYMENT_METHOD[0].NAME, shippingMethod.NAME);
                            Swal({
                                type: "success",
                                title: "Yayy!!",
                                text: `You ordered successfully.`,
                                onClose: () => {
                                    this.fetchCartProducts();
                                    this.setState({
                                        redirectTo: <Redirect to={ROUTE_NAME.PRODUCTS} />
                                    });
                                }
                            });
                        } else {
                            console.log(res);
                            Swal({
                                type: "error",
                                title: "Oops...",
                                text: `${res.message}`
                            });
                        }
                    });
                }
            }).then(modalInfo => {
                if (modalInfo.dismiss === Swal.DismissReason.timer) {
                    Swal({
                        type: "question",
                        title: "Noo...",
                        text: `Server time out! Please try again later.`
                    });
                }
            });
        }
    };

    handleShippingMethodSelect = method => {
        this.setState({
            shippingMethod: method,
            shippingFee: method.SHIPPING_FEE,
            shippingMethodIsInvalid: false,
            errorMessage: ""
        });
    };

    generatePaymentMethods = () => {
        return PAYMENT_METHOD.map((method, index) => (
            <PaymentMethod
                key={index}
                methodName={method.NAME}
                description={method.DESCRIPTION}
                fee={method.SHIPPING_FEE}
                handleOnSelect={() => this.handleShippingMethodSelect(method)}
                isSelected={method.NAME === this.state.shippingMethod.NAME}
            />
        ));
    };

    generateCartItemList = () => {
        const { cartItems } = this.props;
        const { couponDiscPercent, couponMoney } = this.state;
        if (parseFloat(couponDiscPercent) > 1) this.setState({ couponDiscPercent: 0 });
        let totalPrice = 0;
        let discountTotal = 0;
        let itemElements = cartItems.map((cartItem, index) => {
            let price = cartItem.price - cartItem.price * cartItem.discPercent;
            let discountPrice;

            discountPrice = price - price * couponDiscPercent - couponMoney;

            totalPrice += price * cartItem.amount;
            discountTotal += discountPrice * cartItem.amount;

            return (
                <li key={index} className="item-product-name">
                    <span>{`[${cartItem.amount}] ${cartItem.product_name}`}</span>
                    <span>{`${withCommas(Math.round(price))} ₫`}</span>
                </li>
            );
        });
        this.total = totalPrice;
        this.discountTotal = discountTotal;
        return itemElements;
    };

    render = () => {
        const {
            redirectTo,
            fullNameIsInvalid,
            fullName,
            emailIsInvalid,
            email,
            addressIsInvalid,
            phoneNumberIsInvalid,
            couponMessage,
            phoneNumber,
            address,
            shippingNote,
            shippingFee,
            couponStatusCode,
            couponCode,
            shippingMethodIsInvalid,
            errorMessage
        } = this.state;
        const { cartItems } = this.props;
        return (
            <div>
                {redirectTo}
                {/* <!-- ##### Breadcumb Area Start ##### --> */}
                <div className="breadcumb_area bg-img" style={{ backgroundImage: "url(/img/bg-img/breadcumb.jpg)" }}>
                    <div className="container h-100">
                        <div className="row h-100 align-items-center">
                            <div className="col-12">
                                <div className="page-title text-center">
                                    <h2>Checkout</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- ##### Breadcumb Area End ##### --> */}

                {/* <!-- ##### Checkout Area Start ##### --> */}
                <div className="checkout_area section-padding-80">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <div className="checkout_details_area mt-50 clearfix">
                                    <div className="cart-page-heading mb-30">
                                        <h5>Billing Address</h5>
                                    </div>
                                    <form action="#" method="post">
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label htmlFor="full_name">
                                                    Fullname <span>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={"form-control" + (fullNameIsInvalid ? " is-invalid" : "")}
                                                    id="full_name"
                                                    required
                                                    value={fullName}
                                                    onChange={e => {
                                                        if (e.currentTarget.value === "")
                                                            this.setState({ fullName: e.target.value, fullNameIsInvalid: true });
                                                        else this.setState({ fullName: e.target.value, fullNameIsInvalid: false });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-12 mb-4">
                                                <label htmlFor="email_address">
                                                    Email <span>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className={"form-control" + (emailIsInvalid ? " is-invalid" : "")}
                                                    id="email_address"
                                                    value={email}
                                                    onChange={e => {
                                                        if (e.currentTarget.value === "")
                                                            this.setState({ email: e.target.value, emailIsInvalid: true });
                                                        else this.setState({ email: e.target.value, emailIsInvalid: false });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label htmlFor="street_address">
                                                    Billing Address <span>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={"form-control mb-3" + (addressIsInvalid ? " is-invalid" : "")}
                                                    id="street_address"
                                                    value={address}
                                                    onChange={e => {
                                                        if (!e.target.value || e.target.value === "")
                                                            this.setState({ address: e.target.value, addressIsInvalid: true });
                                                        else this.setState({ address: e.target.value, addressIsInvalid: false });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label htmlFor="phone_number">
                                                    Phone No <span>*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    className={"form-control" + (phoneNumberIsInvalid ? " is-invalid" : "")}
                                                    id="phone_number"
                                                    min="0"
                                                    value={phoneNumber}
                                                    onChange={e => {
                                                        if (!e.target.value || e.target.value === "")
                                                            this.setState({ phoneNumber: e.target.value, phoneNumberIsInvalid: true });
                                                        else this.setState({ phoneNumber: e.target.value, phoneNumberIsInvalid: false });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-12 mb-4">
                                                <label htmlFor="shipping_note">Note </label>
                                                <textarea
                                                    className="form-control"
                                                    id="shipping_note"
                                                    value={shippingNote}
                                                    onChange={e => this.setState({ shippingNote: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-12">
                                                <div className="custom-control custom-checkbox d-block mb-2">
                                                    <input type="checkbox" className="custom-control-input" id="customCheck1" />
                                                    <label className="custom-control-label" htmlFor="customCheck1">
                                                        Terms and conitions
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="col-12 col-md-6 col-lg-5 ml-lg-auto">
                                <div className="order-details-confirmation">
                                    {cartItems && cartItems.length > 0 ? (
                                        <>
                                            <div className="cart-page-heading">
                                                <h5>Your Order</h5>
                                                <p>The Details</p>
                                            </div>

                                            <ul className="order-details-form mb-4">
                                                <li className="item-header">
                                                    <span>Product</span> <span>Price</span>
                                                </li>
                                                {this.generateCartItemList()}
                                                <li className="item-header">
                                                    <span>Shipping</span>{" "}
                                                    <span>{`${!shippingFee ? "FREE" : withCommas(shippingFee)}`}</span>
                                                </li>
                                                <li className="item-header">
                                                    <div className="row">
                                                        <div className="col-md-5 d-flex align-items-center">
                                                            <span>COUPON</span>
                                                        </div>
                                                        <FormInput
                                                            type="text"
                                                            additionalClass="col-md-5 mb-0"
                                                            value={couponCode.toUpperCase()}
                                                            onChangeHandler={e => {
                                                                this.setState({ couponCode: e.target.value });
                                                            }}
                                                            disabled={couponStatusCode === 1 ? true : false}
                                                        />
                                                        <button
                                                            className={
                                                                "col-md-2 btn btn-sm" +
                                                                (couponStatusCode === 1 ? " btn-danger" : " btn-info")
                                                            }
                                                            onClick={this.handleApplyCoupon}
                                                            disabled={!couponCode}
                                                        >
                                                            {couponStatusCode === 1 ? "Cancel" : "Apply"}
                                                        </button>
                                                        <div
                                                            className="col-md-12 coupon-status-message text-right"
                                                            style={{ color: couponStatusCode === 1 ? "green" : "red" }}
                                                        >
                                                            {couponMessage}
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className="total-header">
                                                    <span>Total</span>
                                                    <span>
                                                        <span
                                                            className={this.discountTotal !== this.total ? "old-price" : ""}
                                                        >{`${withCommas(Math.round(this.total + shippingFee))} ₫`}</span>
                                                        <br />
                                                        {this.discountTotal !== this.total
                                                            ? `${withCommas(Math.round(this.discountTotal + shippingFee))} ₫`
                                                            : ""}
                                                    </span>
                                                </li>
                                            </ul>

                                            <div
                                                id="accordion"
                                                role="tablist"
                                                className={
                                                    "mb-4 form-control shipping-method-container" +
                                                    (shippingMethodIsInvalid ? " is-invalid" : "")
                                                }
                                            >
                                                {this.generatePaymentMethods()}
                                            </div>
                                            <div className="error-message d-flex justicy-content-center">{errorMessage}</div>
                                            <button className="btn essence-btn" onClick={() => this.handleOrder()}>
                                                Place Order
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">Cart is Empty!</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- ##### Checkout Area End ##### --> */}
            </div>
        );
    };
}

class PaymentMethod extends Component {
    render = () => {
        let collapseId = LIB.generateRandomString();
        const { isSelected, methodName, description, fee, handleOnSelect } = this.props;
        return (
            <div className="card">
                <div className="card-header" role="tab" id="headingOne">
                    <h6 className="mb-0">
                        <a
                            className={"shipping-method-name " + (isSelected ? "shippingmethod-selected" : "")}
                            data-toggle="collapse"
                            href={"#" + collapseId}
                            aria-expanded="false"
                            aria-controls={collapseId}
                            onClick={handleOnSelect}
                        >
                            <i className={"fa mr-3" + (isSelected ? " fa-check-square" : " fa-square-o")} />
                            {methodName}
                        </a>
                    </h6>
                </div>

                <div id={collapseId} className="collapse" role="tabpanel" aria-labelledby="headingOne" data-parent="#accordion">
                    <div className="card-body">
                        <p>{description}</p>
                        <p>
                            <b>FEE: </b>
                            {withCommas(Math.round(fee))} ₫
                        </p>
                    </div>
                </div>
            </div>
        );
    };
}

export default CheckoutDetail;
