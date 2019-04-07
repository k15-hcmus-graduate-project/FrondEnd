import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Cart.scss";
import { ROUTE_NAME } from "../../../routes/main.routing";
import { withCommas, showAlert } from "../../../helpers/lib";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import { ACTIVE_TYPE } from "../../../config/constants";

const INTERNAL_CONFIG = {
    AMOUNT_UPATE_DELAY_DURATION: 300
};

class Cart extends Component {
    static propTypes = {
        toggleCart: PropTypes.func,
        updateCartProducts: PropTypes.func,
        isLoggedIn: PropTypes.bool,
        products: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.total = 0;
        this.amountDelayTimeout = null;
    }

    componentDidMount = () => {
        this.fetchCartProducts();
    };

    fetchCartProducts = () => {
        const { isLoggedIn, changeLoginStatus } = this.props;
        if (isLoggedIn) {
            AuthService.verifyToken(changeLoginStatus);
            WebService.getCart(AuthService.getTokenUnsafe()).then(res => {
                const result = JSON.parse(res);
                if (result.status && result.status === true) {
                    if (result.products) {
                        result.products.forEach(prd => {
                            prd.images = JSON.parse(prd.images);
                        });
                    }
                    this.props.updateCartProducts(result.products);
                }
            });
        }
    };

    handleProductRemove = product => {
        if (product.id) {
            WebService.deleteItemFromCart(AuthService.getTokenUnsafe(), product.id).then(r => {
                console.log(r);
                const res = JSON.parse(r);

                if (res.code === 200) {
                    showAlert(`Removed ${product.product_name}`);
                    this.fetchCartProducts();
                }
            });
        }
    };

    handleProductAmountChange = (cartItem, amount) => {
        if (cartItem.id && cartItem.amount + amount > 0) {
            cartItem.amount += amount;

            if (this.amountDelayTimeout) {
                clearTimeout(this.amountDelayTimeout);
            }
            this.amountDelayTimeout = setTimeout(() => {
                WebService.updateItemInCart(AuthService.getTokenUnsafe(), cartItem.id, cartItem.amount).then(r => {
                    const res = JSON.parse(r);

                    if (res.status === ACTIVE_TYPE.TRUE) {
                        console.log("Updated amount");
                    }
                });
            }, INTERNAL_CONFIG.AMOUNT_UPATE_DELAY_DURATION);
        }
    };

    generateProductBoxes = () => {
        let R = [];
        const { products, toggleCart } = this.props;
        if (products) {
            products.forEach((cartItem, index) => {
                const discountedPrice = cartItem.price - cartItem.price * cartItem.discPercent;

                R.push(
                    <div key={index} className="single-cart-item">
                        <span className="product-remove" onClick={() => this.handleProductRemove(cartItem)}>
                            <i className="fa fa-close" aria-hidden="true" />
                        </span>
                        <Link
                            replace
                            to={{
                                pathname: ROUTE_NAME.PRODUCT_DETAIL + "/" + cartItem.id,
                                search: ""
                            }}
                            className="product-image"
                        >
                            <img
                                src={cartItem.images[0]}
                                className="cart-thumb"
                                alt=""
                                onClick={() => {
                                    toggleCart(false);
                                }}
                            />
                            {/* <!-- Cart Item Desc --> */}
                            <div className="cart-item-desc">
                                <span className="badge">{cartItem.category.category_name}</span>
                                <h6>{cartItem.product_name}</h6>
                                <div className="cart-item-quantity d-flex align-items-center justify-content-between">
                                    <button className="btn btn-danger btn-sm" onClick={() => this.handleProductAmountChange(cartItem, -1)}>
                                        -
                                    </button>
                                    <span className="badge item-quantity">{`${cartItem.amount}`}</span>
                                    <button className="btn btn-success btn-sm" onClick={() => this.handleProductAmountChange(cartItem, 1)}>
                                        +
                                    </button>
                                </div>
                                <p className="price">{withCommas(Math.round(discountedPrice * cartItem.amount)) + " ₫"}</p>
                            </div>
                        </Link>
                    </div>
                );
            });
        }

        return R;
    };

    generateCartItemNames = () => {
        let R = [];
        let total = 0;
        const { products } = this.props;
        if (products) {
            products.forEach((cartItem, index) => {
                let itemPrice = (cartItem.price - cartItem.price * cartItem.discPercent) * cartItem.amount;

                R.push(
                    <li key={index} className="cart-item-name">
                        {cartItem.product_name} x {cartItem.amount}
                        <span />
                        <span>{withCommas(Math.round(itemPrice))} ₫</span>
                    </li>
                );

                total += itemPrice;
            });
        }

        this.total = total;

        return R;
    };

    render = () => {
        const { isActive, toggleCart, products } = this.props;
        return (
            <div>
                {/* <!-- ##### Right Side Cart Area ##### --> */}
                <div
                    className={"cart-bg-overlay " + (isActive ? "cart-bg-overlay-on" : "")}
                    onClick={() => {
                        toggleCart(false);
                    }}
                />

                <div className={"right-side-cart-area " + (isActive ? "cart-on" : "")}>
                    {/* <!-- Cart Button --> */}
                    <div
                        className="cart-button"
                        onClick={() => {
                            toggleCart(false);
                        }}
                    >
                        <div id="rightSideCart">
                            <img src="/img/core-img/cancel.svg" alt="Close" draggable="false" />
                        </div>
                    </div>

                    <div className="cart-content d-flex">
                        {/* EMPTY CART ICON */}
                        {(!products || products.length === 0) && (
                            <div className="empty-cart">
                                <img src="/img/core-img/emptycart.png" alt="" draggable="false" />
                                <h2 className="text-center">Your cart is empty!</h2>
                            </div>
                        )}

                        {/* <!-- Cart List Area --> */}
                        {products && products.length > 0 && <div className="cart-list">{this.generateProductBoxes()}</div>}

                        {/* <!-- Cart Summary --> */}
                        {this.props.products && this.props.products.length > 0 && (
                            <div className="cart-amount-summary">
                                <h2>Summary</h2>
                                <ul className="summary-table">
                                    {this.generateCartItemNames()}
                                    <li className="summary-header">
                                        <span>total:</span> <span>{withCommas(Math.round(this.total))} ₫</span>
                                    </li>
                                </ul>
                                <div
                                    className="checkout-btn mt-100"
                                    onClick={() => {
                                        this.props.toggleCart(false);
                                    }}
                                >
                                    <Link to={ROUTE_NAME.CHECKOUT} className="btn essence-btn">
                                        check out
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* <!-- ##### Right Side Cart End ##### --> */}
            </div>
        );
    };
}

export default Cart;
