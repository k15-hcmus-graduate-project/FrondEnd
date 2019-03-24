// @flow
import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import PropTypes from "prop-types";
import qs from "query-string";
import "./Products.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import { ROUTE_NAME } from "../../../routes/main.routing";
import { showAlert } from "../../../helpers/lib";
import { withCommas } from "../../../helpers/lib";
import { QUERY_PARAMS } from "../../../config/constants";
import SearchPanel from "../SearchPanel";
import Paginator from "../../common/Paginator";
import LoadingBar from "../../common/LoadingBar";

const INTIAL_STATE = {
    showLoadingBar: false
};

class Products extends Component {
    static propTypes = {
        currentPage: PropTypes.number,
        pageSize: PropTypes.number,
        totalItems: PropTypes.number,
        isLoggedIn: PropTypes.bool,
        updateCartProducts: PropTypes.func,
        cart: PropTypes.shape({
            cart: PropTypes.array
        }),
        products: PropTypes.array
    };

    constructor(props: any) {
        super(props);
        this.state = INTIAL_STATE;
        this.handleAddProductToCart = this.handleAddProductToCart.bind(this);
    }

    componentDidMount = () => {
        const params = qs.parse(this.props.history.location.search);
        const pageIndex = Number(params.page);
        const pageSize = Number(params.size);
        this.retrieveURLParams(params, true);
        if (pageIndex && pageSize && [12, 24, 36].indexOf(pageSize) !== -1) {
            this.handleFilterChange({
                currentPage: pageIndex,
                pageSize: pageSize
            });
        } else {
            const { currentPage, pageSize } = this.props; // get defautl
            this.fetchProducts(currentPage, pageSize);
            this.updateURLParams({
                currentPage: currentPage,
                pageSize: pageSize
            });
        }
    };

    componentWillReceiveProps = newProps => {
        const params = qs.parse(newProps.history.location.search);
        this.retrieveURLParams(params);
    };

    resetParamsURL = () => {
        this.industryIdFromURL = null;
        this.branchIdFromURL = null;
        this.categoryIdFromURL = null;
        this.brandIdFromURL = null;
        this.keywordFromURL = null;
        this.priceFromURL = null;
        this.priceToURL = null;
        this.previousParams = null;
    };
    retrieveURLParams = (params, isOnComponentLoad = false) => {
        const industryIdFromURL = Number(params.ind);
        const branchIdFromURL = Number(params.brch);
        const categoryIdFromURL = Number(params.cat);
        const brandIdFromURL = Number(params.brd);
        const keywordFromURL = params.q;
        const priceFromURL = Number(params.pfrom);
        const priceToURL = Number(params.pto);

        let isQueryStringUpdated = false;

        if (industryIdFromURL && industryIdFromURL !== this.industryIdFromURL) {
            isQueryStringUpdated = true;
            this.industryIdFromURL = industryIdFromURL;
        } else {
            this.industryIdFromURL = null;
        }
        if (branchIdFromURL && branchIdFromURL !== this.branchIdFromURL) {
            isQueryStringUpdated = true;
            this.branchIdFromURL = branchIdFromURL;
        } else this.branchIdFromURL = null;
        if (categoryIdFromURL && categoryIdFromURL !== this.categoryIdFromURL) {
            isQueryStringUpdated = true;
            this.categoryIdFromURL = categoryIdFromURL;
        } else this.categoryIdFromURL = null;
        if (brandIdFromURL && brandIdFromURL !== this.brandIdFromURL) {
            isQueryStringUpdated = true;
            this.brandIdFromURL = brandIdFromURL;
        } else this.brandIdFromURL = null;
        if (keywordFromURL && keywordFromURL !== this.keywordFromURL) {
            isQueryStringUpdated = true;
            this.keywordFromURL = keywordFromURL;
        } else this.keywordFromURL = null;

        if (priceFromURL && priceToURL && (priceFromURL !== this.priceFromURL || priceToURL !== this.priceToURL)) {
            isQueryStringUpdated = true;
            this.priceFromURL = priceFromURL;
            this.priceToURL = priceToURL;
        }

        if (isQueryStringUpdated && !isOnComponentLoad) {
            console.log("UPDATE");
            this.fetchProducts(this.props.currentPage, this.props.pageSize);
        }
    };

    updateURLParams = ({ currentPage, pageSize }) => {
        let searchQuery = `?size=${pageSize || this.props.pageSize}&page=${currentPage || this.props.currentPage}`;

        if (this.brandIdFromURL) {
            searchQuery += `&${QUERY_PARAMS.brandId}=${this.brandIdFromURL}`;
        }
        if (this.industryIdFromURL) {
            searchQuery += `&${QUERY_PARAMS.industryId}=${this.industryIdFromURL}`;
        }
        if (this.branchIdFromURL) {
            searchQuery += `&${QUERY_PARAMS.branchId}=${this.branchIdFromURL}`;
        }
        if (this.categoryIdFromURL) {
            searchQuery += `&${QUERY_PARAMS.categoryId}=${this.categoryIdFromURL}`;
        }
        if (this.keywordFromURL) {
            searchQuery += `&${QUERY_PARAMS.keyword}=${this.keywordFromURL}`;
        }
        if (this.priceFromURL && this.priceToURL) {
            searchQuery += `&${QUERY_PARAMS.minPrice}=${this.priceFromURL}&${QUERY_PARAMS.maxPrice}=${this.priceToURL}`;
        }

        this.props.history.push({
            search: searchQuery
        });
    };

    fetchProducts = (currentPage, pageSize) => {
        const queryObj = {};

        if (this.brandIdFromURL) {
            queryObj.brandId = this.brandIdFromURL;
        }
        if (this.industryIdFromURL) {
            queryObj.industryId = this.industryIdFromURL;
        }
        if (this.branchIdFromURL) {
            queryObj.branchId = this.branchIdFromURL;
        }
        if (this.categoryIdFromURL) {
            queryObj.categoryId = this.categoryIdFromURL;
        }
        if (this.keywordFromURL) {
            queryObj.keyword = this.keywordFromURL;
        }
        if (this.priceFromURL && this.priceToURL) {
            queryObj.minPrice = this.priceFromURL;
            queryObj.maxPrice = this.priceToURL;
        }
        this.setState({
            showLoadingBar: true
        });
        WebService.getAllProducts(pageSize, (currentPage - 1) * pageSize, queryObj)
            .then(res => {
                this.setState({
                    showLoadingBar: false
                });
                const result = JSON.parse(res);
                // console.log(result);
                if (result.products) {
                    this.props.updateProductList(result.products.map(prd => ({ ...prd, images: JSON.parse(prd.images) })));
                    this.props.changePageInfo({ totalItems: result.totalItems });
                } else {
                    console.log(" have no products");
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    fetchCartProducts = () => {
        const { isLoggedIn } = this.props;
        console.log(isLoggedIn);
        if (isLoggedIn) {
            console.log("update thoi nao");
            WebService.getCart(AuthService.getTokenUnsafe()).then(res => {
                const result = JSON.parse(res);
                console.log(result);
                if (result.status === true) {
                    if (result.products) {
                        result.products.forEach(prd => (prd.images = JSON.parse(prd.images)));
                    }
                    this.props.updateCartProducts(result.products);
                }
            });
        }
    };

    handleAddProductToCart = product => {
        console.log(product);
        const { isLoggedIn, cart } = this.props;
        if (isLoggedIn) {
            const currentCartItems = cart.products;
            if (product.id) {
                let cartItemAmount = 0;
                currentCartItems.map(cartItem => {
                    if (cartItem.id === product.id) {
                        cartItemAmount = cartItem.amount;
                    }
                });
                cartItemAmount += 1;
                WebService.addItemToCart(AuthService.getTokenUnsafe(), product.id, cartItemAmount).then(r => {
                    const res = JSON.parse(r);
                    if (res.status) {
                        showAlert(`Added ${product.product_name} to Cart!`);
                        this.fetchCartProducts();
                    }
                });
            }
        } else {
            showAlert("You have not logged in yet", "error");
        }
    };

    handleFilterChange = ({ currentPage, pageSize, totalItems }) => {
        let payloadObj = {};

        if (currentPage) {
            payloadObj.currentPage = currentPage;
        }

        if (pageSize) {
            payloadObj.pageSize = Number(pageSize);
        }

        if (totalItems) {
            payloadObj.totalItems = totalItems;
        }

        this.props.changePageInfo(payloadObj);
        if (pageSize || currentPage) {
            this.updateURLParams({
                currentPage: payloadObj.currentPage,
                pageSize: payloadObj.pageSize
            });

            this.fetchProducts(payloadObj.currentPage || this.props.currentPage, payloadObj.pageSize || this.props.pageSize);
        }
    };

    generateProducts = () => {
        const { products } = this.props;
        console.log(products);
        const productsElements = [];

        products.map((product, index) => {
            productsElements.push(
                <Product
                    // key={product.id}
                    key={index}
                    product={product}
                    buttonTitle="Add to cart"
                    onClickHandler={this.handleAddProductToCart}
                />
            );
        });

        return productsElements;
    };

    render = () => {
        const { showLoadingBar } = this.state;
        const { totalItems, pageSize, currentPage } = this.props;
        return (
            <div>
                {showLoadingBar && <LoadingBar />}
                {/* <!-- ##### Breadcumb Area Start ##### --> */}
                <div className="breadcumb_area bg-img" style={{ backgroundImage: "url(/img/bg-img/breadcumb.jpg)" }}>
                    <div className="container h-100">
                        <div className="row h-100 align-items-center">
                            <div className="col-12">
                                <div className="page-title text-center">
                                    <h2>Products</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- ##### Breadcumb Area End ##### --> */}

                {/* <!-- ##### Shop Grid Area Start ##### --> */}
                <section className="shop_grid_area section-padding-80">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-4 col-lg-3">
                                <SearchPanel />
                            </div>

                            <div className="col-12 col-md-8 col-lg-9">
                                <div className="shop_grid_product_area">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="product-topbar d-flex align-items-center justify-content-between">
                                                {/* <!-- Total Products --> */}
                                                <div className="total-products">
                                                    <p>
                                                        <span>{totalItems}</span> products found
                                                    </p>
                                                </div>
                                                <div className="d-flex">
                                                    {/* <!-- Number of Items --> */}
                                                    <div className="product-sorting d-flex mr-3">
                                                        <p>Display:</p>
                                                        <form action="#" method="get">
                                                            <select
                                                                name="select"
                                                                value={pageSize}
                                                                onChange={e => {
                                                                    this.handleFilterChange({ pageSize: e.target.value, currentPage: 1 });
                                                                }}
                                                            >
                                                                <option value={12}>12</option>
                                                                <option value={24}>24</option>
                                                                <option value={36}>36</option>
                                                            </select>
                                                            <input type="submit" className="d-none" value="" />
                                                        </form>
                                                    </div>
                                                    {/* <!-- Sorting --> */}
                                                    <div className="product-sorting d-flex">
                                                        <p>Sort by:</p>
                                                        <form action="#" method="get">
                                                            <select name="select" id="sortByselect">
                                                                <option value="value">Highest Rated</option>
                                                                <option value="value">Newest</option>
                                                                <option value="value">Price: $$ - $</option>
                                                                <option value="value">Price: $ - $$</option>
                                                            </select>
                                                            <input type="submit" className="d-none" value="" />
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRODUCTS */}
                                    <div className="row">{this.generateProducts()}</div>
                                </div>
                                <Paginator
                                    handlePageChange={currentPage => {
                                        this.handleFilterChange({ currentPage });
                                    }}
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    totalItems={totalItems}
                                />
                            </div>
                        </div>
                    </div>
                </section>
                {/* <!-- ##### Shop Grid Area End ##### --> */}
            </div>
        );
    };
}

class Product extends Component {
    static propTypes = {
        product: PropTypes.shape({
            images: PropTypes.array
        }),
        buttonTitle: PropTypes.string
    };

    render = () => {
        const { product, onClickHandler, buttonTitle } = this.props;
        if (!product) return "";
        const discountedPrice = Math.round(product.price - product.price * product.discPercent);
        // const productImages = JSON.parse(product.images);
        return (
            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single-product-wrapper">
                    {/* <!-- Product Image --> */}
                    <div className="product-img">
                        <Link to={ROUTE_NAME.PRODUCT_DETAIL + "/" + product.id}>
                            <img src={product.images[0]} alt="" />
                            {/* <!-- Hover Thumb --> */}
                            {product.images[1] && <img className="hover-img" src={product.images[1]} alt="" />}
                        </Link>

                        {/* <!-- Product Badge --> */}
                        {product.discPercent !== 0 && (
                            <div className="product-badge offer-badge">
                                <span>{"-" + Math.round(product.discPercent * 100) + "%"}</span>
                            </div>
                        )}

                        {/* <!-- Favourite --> */}
                        <div className="product-favourite">
                            <a href="/" className="favme fa fa-heart">
                                <span />
                            </a>
                        </div>
                    </div>

                    {/* <!-- Product Description --> */}
                    <div className="product-description">
                        <span>{product.category.category_name}</span>
                        <Link to={ROUTE_NAME.PRODUCT_DETAIL + "/" + product.id}>
                            <h6>{product.product_name}</h6>
                        </Link>
                        <p className="product-price">
                            {product.discPercent !== 0 && <span className="old-price">{withCommas(product.price) + " ₫"}</span>}
                            {withCommas(discountedPrice) + " ₫"}
                        </p>

                        {/* <!-- Hover Content --> */}
                        <div className="hover-content">
                            {/* <!-- Add to Cart --> */}
                            <div className="add-to-cart-btn">
                                <button className="btn essence-btn" onClick={() => onClickHandler(product)}>
                                    {buttonTitle}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default withRouter(Products);
