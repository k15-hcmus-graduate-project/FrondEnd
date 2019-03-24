// StyleSheets
import React, { Component } from "react";
import PropTypes from "prop-types";
import { FacebookProvider, Comments } from "react-facebook";
import "./ProductDetail.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import { showAlert } from "../../../helpers/lib";
import { withCommas } from "../../../helpers/lib";
import Loader from "../../common/Loader/Loader";

const INTITIAL_STATE = {
    product: {},
    productFound: false
};

class ProductDetail extends Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        updateCartProducts: PropTypes.func,
        cart: PropTypes.shape({
            products: PropTypes.array
        })
    };

    constructor(props) {
        super(props);
        this.state = INTITIAL_STATE;
    }

    componentWillMount = () => {
        this.fetchProduct();
    };

    componentWillUpdate = nextProps => {
        if (nextProps.match.params.id !== this.props.match.params.id) {
            this.fetchProduct();
        }
    };

    fetchProduct = () => {
        const productId = Number(this.props.match.params.id);
        if (!isNaN(productId) && productId > 0) {
            WebService.getProduct(productId).then(res => {
                const product = JSON.parse(res);
                console.log(product);
                if (product.status !== 500) {
                    product.images = JSON.parse(product.images);
                    console.log(product.images);
                    this.setState({
                        product,
                        productFound: true
                    });
                } else {
                    console.log(product);
                }
            });
        }
    };

    fetchCartProducts = () => {
        const { isLoggedIn } = this.props;
        console.log(isLoggedIn);
        if (isLoggedIn) {
            WebService.getCart(AuthService.getTokenUnsafe()).then(res => {
                console.log(res);
                const result = JSON.parse(res);
                console.log(result);
                if (result.status.status === "TRUE") {
                    if (result.products) {
                        result.products.forEach(prd => (prd.images = JSON.parse(prd.images)));
                    }
                    this.props.updateCartProducts(result.products);
                }
            });
        }
    };

    handleAddProductToCart = (product: any) => {
        const { isLoggedIn, cart } = this.props;
        if (isLoggedIn) {
            const currentCartItems = cart.products;
            if (product.id) {
                let cartItemAmount = 0;
                if (currentCartItems)
                    currentCartItems.map(cartItem => {
                        if (cartItem.id === product.id) {
                            console.log(cartItem);
                            cartItemAmount = cartItem.amount;
                        }
                    });
                cartItemAmount += 1;
                WebService.addItemToCart(AuthService.getTokenUnsafe(), product.id, cartItemAmount).then(r => {
                    console.log(r);
                    const res = JSON.parse(r);
                    if (res.status) {
                        showAlert(`Added ${product.productName} to Cart!`);
                        this.fetchCartProducts();
                    }
                });
            }
        } else {
            showAlert("You have not logged in yet", "error");
        }
    };

    generatePictures = () => {
        let r = [];
        if (this.state.product.images) {
            this.state.product.images.forEach((imageURL, index) => {
                r.push(
                    <div key={index} className={"carousel-item" + (index === 0 ? " active" : "")}>
                        <img className="d-block w-100" src={imageURL} alt="" />
                    </div>
                );
            });
        }

        return r;
    };

    render = () => {
        if (!this.state.productFound) {
            return <div className="d-flex justify-content-center p-5">Product not found</div>;
        } else if (Object.keys(this.state.product).length === 0) {
            return <Loader />;
        } else {
            const { product } = this.state;
            const discountedPercent = Math.round(product.discPercent * 100);
            const discountedPrice = Math.round(product.price - product.price * product.discPercent);
            const listdescription = product.description.split("\n");
            const listDescription = [];
            for (var j = 0; j < listdescription.length; j++) {
                listDescription[j] = (
                    <p key={j} className="product-desc">
                        {listdescription[j]}
                    </p>
                );
            }
            console.log(listDescription);
            return (
                <div className="single_product_details_area d-flex align-items-center">
                    <div id="images-slider" className="single_product_thumb carousel slide" data-ride="carousel">
                        <div className="carousel-inner">{this.generatePictures()}</div>
                        <a className="carousel-control-prev owl-prev" href="#images-slider" role="button" data-slide="prev">
                            <span className="fa fa-chevron-circle-left fa-5x" aria-hidden="false" />
                            <span className="sr-only">Previous</span>
                        </a>
                        <a className="carousel-control-next owl-next" href="#images-slider" role="button" data-slide="next">
                            <span className="fa fa-chevron-circle-right fa-5x" aria-hidden="false" />
                            <span className="sr-only">Next</span>
                        </a>
                    </div>

                    {/* <!-- Single Product Description --> */}
                    <div className="single_product_desc clearfix">
                        <span>{product.brand && product.brand[0].brand_name}</span>
                        <a href="cart.html">
                            <h2>{product.product_name}</h2>
                        </a>
                        <p className="product-price">
                            {product.discPercent !== 0 && <span className="old-price">{withCommas(product.price) + " ₫"}</span>}
                            {withCommas(discountedPrice) + " ₫  "}
                            {discountedPercent ? "(-" + discountedPercent + "%)" : null}
                        </p>
                        <h4>{listDescription}</h4>
                        {/* <!-- Form --> */}
                        <form className="cart-form clearfix" method="post">
                            {/* <!-- Cart & Favourite Box --> */}
                            <div className="cart-fav-box d-flex align-items-center">
                                {/* <!-- Cart --> */}
                                <button
                                    type="button"
                                    name="addtocart"
                                    className="btn essence-btn"
                                    onClick={() => this.handleAddProductToCart(product)}
                                >
                                    Add to cart
                                </button>
                                {/* <!-- Favourite --> */}
                                <div className="product-favourite ml-4">
                                    <a href="#/" className="favme fa fa-heart">
                                        <span />
                                    </a>
                                </div>
                            </div>

                            <div className="cart-fav-box d-flex align-items-center justify-content-end">
                                <a href="/">{product.category && product.category[0].category_name}</a>
                            </div>
                        </form>
                    </div>

                    {/* PRODUCT FULL DESCRIPTION */}
                    <div className="full-description-container">
                        <div className="container">{product.description}</div>
                    </div>

                    <div className="fb-comment-plugin-container">
                        <FacebookProvider appId="486326855227569">
                            <Comments href={"https://tidi-binpossible49.c9users.io" + this.props.location.pathname} className="kdjf" />
                        </FacebookProvider>
                    </div>
                </div>
            );
        }
    };
}

export default ProductDetail;
