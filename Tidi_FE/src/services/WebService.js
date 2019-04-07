// External Dependencies
import Request from "request";
import jwtDecode from "jwt-decode";
import COSNTANT from "../config/constants";
import {
    API_USERS_ADD,
    API_PRODUCT_INDUSTRY,
    API_PRODUCT_BRAND,
    API_PRODUCT_ALL,
    API_USERS_CART,
    API_USERS_LOGIN,
    API_USERS_ONE,
    API_CHECKOUT_COUPONSTT,
    API_CHECKOUT,
    API_USERS_ADMIN_GET,
    API_USERS_ADMIN_UPDATE,
    API_USERS_ADMIN_ADD,
    API_PRODUCT_ADMIN_ALL,
    API_PRODUCT_ADMIN_BRAND_ALL,
    API_PRODUCT_ADMIN_INDUSTRY_ALL,
    API_PRODUCT_ADMIN_BRANCH_ALL,
    API_PRODUCT_ADMIN_CATEGORY_ALL,
    API_PRODUCT_ADMIN_UPDATE,
    API_PRODUCT_ADMIN_ADD,
    API_PRODUCT_ADMIN_BRAND_UPDATE,
    API_PRODUCT_ADMIN_BRAND_ADD,
    API_PRODUCT_ADMIN_BRAND_BRAND,
    API_CHECKOUT_ADMIN_ORDER,
    API_CHECKOUT_ORDER,
    API_CHECKOUT_ORDER_UPDATE,
    API_CHECKOUT_ORDERDETAIL
} from "../config/AppConfig";

const apiPrefix = {
    authentication: "/auth",
    account: "/account",
    product: "/product",
    cart: "/cart",
    checkout: "/checkout",
    admin: "/admin",
    zalopay: "/zp"
};

const fetch = ({ method, reqBody, route, jwtToken }) => {
    return new Promise((resolve, reject) => {
        const HttpHeader = {
            "Content-Type": "application/json",
            "x-access-token": jwtToken
        };

        // if (jwtToken) {
        //     HttpHeader.Authorization = jwtToken;
        // }

        Request(
            {
                method,
                uri: COSNTANT.REST_SERVER + route,
                qs: reqBody && (method === "POST" || method === "DELETE" || method === "PUT" ? reqBody : undefined),
                body: reqBody && (method === "POST" || method === "DELETE" || method === "PUT" ? JSON.stringify(reqBody) : undefined),
                headers: HttpHeader
            },
            (err, res, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            }
        );
    });
};

export default {
    fetch,

    /*
     *       SECTION 1: AUTHENTICATION
     */

    // 1.1 Login
    login: (username, password) => {
        return fetch({
            method: "POST",
            reqBody: {
                username,
                password
            },
            route: API_USERS_LOGIN
        });
    },

    // 1.2 Registration
    register: (username, password, email, fullName, dateOfBirth, phone, gender, address, avatar) => {
        return fetch({
            method: "POST",
            reqBody: {
                username,
                password,
                email,
                fullName,
                dateOfBirth,
                phone,
                gender,
                address,
                avatar
            },
            route: API_USERS_ADD
        });
    },
    // 1.3 Registration email verification
    verifyEmail: verificationCode => {
        return fetch({
            method: "GET",
            route: apiPrefix.authentication + "/emailVerification?verificationCode=" + verificationCode
        });
    },

    // 1.4 Reset password
    resetPassword: username => {
        return fetch({
            method: "POST",
            reqBody: {
                username
            },
            route: apiPrefix.authentication + "/resetPassword"
        });
    },

    // 1.5 Reset password email verification
    verifyEmailResetPassword: (verificationCode, newPassword) => {
        return fetch({
            method: "POST",
            reqBody: {
                verificationCode,
                newPassword
            },
            route: apiPrefix.authentication + "/resetEmailVerification"
        });
    },

    // 1.6 Verify Token
    verifyToken: token => {
        return fetch({
            method: "POST",
            reqBody: {},
            jwtToken: token,
            route: apiPrefix.authentication + "/verifyToken"
        });
    },

    /*
     *       SECTION 2: ACCOUNT
     */

    // 2.1 READ Account information
    readAccountInfo: token => {
        if (token) {
            const { username } = jwtDecode(token).user;
            return fetch({
                method: "GET",
                jwtToken: token,
                route: API_USERS_ONE + `/${username}`
            });
        } else
            return fetch({
                method: "GET",
                jwtToken: token,
                route: API_USERS_ONE
            });
    },

    // 2.2 UPDATE Account information
    updateAccountInfo: (token, { dateOfBirth, address, avatar }) => {
        return fetch({
            method: "POST",
            reqBody: {
                newInfo: {
                    dateOfBirth,
                    address,
                    avatar
                }
            },
            jwtToken: token,
            route: apiPrefix.account + "/updateInfo"
        });
    },

    // 2.3 UPDATE Account password
    updateAccountPassword: (token, password, newPassword) => {
        return fetch({
            method: "POST",
            reqBody: {
                password,
                newPassword
            },
            jwtToken: token,
            route: apiPrefix.account + "/updatePassword"
        });
    },

    /*
     *       SECTION 3: PRODUCT
     */

    // 3.1 Get all industries
    getAllIndustries: () => {
        return fetch({
            method: "GET",
            route: `${API_PRODUCT_INDUSTRY}`
        });
    },

    // 3.2 Get all brands
    getAllBrands: () => {
        return fetch({
            method: "GET",
            route: `${API_PRODUCT_BRAND}`
        });
    },

    // 3.3 Get all products
    getAllProducts: (limit, offset, { industryId, branchId, categoryId, brandId, keyword, minPrice, maxPrice }) => {
        return fetch({
            method: "POST",
            reqBody: {
                limit,
                offset,
                query: {
                    industryId,
                    branchId,
                    categoryId,
                    brandId,
                    keyword,
                    minPrice,
                    maxPrice
                }
            },
            route: `${API_PRODUCT_ALL}`
        });
    },

    // 3.4 Get one product
    getProduct: id => {
        return fetch({
            method: "POST",
            reqBody: {
                id
            },
            route: apiPrefix.product + "/one"
        });
    },

    /*
     *       SECTION 4: CART
     */

    // 4.1 Get all items in cart
    getCart: token => {
        if (token) {
            const { username } = jwtDecode(token).user;
            return fetch({
                method: "GET",
                jwtToken: token,
                route: API_USERS_CART + `?username=${username}`
            });
        } else
            return fetch({
                method: "GET",
                jwtToken: token,
                route: API_USERS_CART
            });
    },

    // 4.2 Insert item
    addItemToCart: (token, productId, amount) => {
        if (!token || !productId || !amount) return null;
        if (token) {
            const { username } = jwtDecode(token).user;
            return fetch({
                method: "POST",
                reqBody: {
                    username,
                    productId,
                    amount
                },
                jwtToken: token,
                route: API_USERS_CART
            });
        } else
            return fetch({
                method: "POST",
                reqBody: {
                    productId,
                    amount
                },
                jwtToken: token,
                route: API_USERS_CART
            });
    },

    // 4.3 Update item
    updateItemInCart: (token, productId, amount) => {
        if (token) {
            const { username } = jwtDecode(token).user;
            return fetch({
                method: "PUT",
                reqBody: {
                    username,
                    productId,
                    amount
                },
                jwtToken: token,
                route: API_USERS_CART
            });
        } else return null;
    },

    // 4.4 Delete item
    deleteItemFromCart: (token, productId) => {
        if (token) {
            const { username } = jwtDecode(token).user;
            console.log(username, productId);
            return fetch({
                method: "DELETE",
                reqBody: {
                    productId: productId,
                    username: username
                },
                jwtToken: token,
                route: API_USERS_CART
            });
        } else return null;
    },

    /*
     *       SECTION 5: CHECKOUT
     */

    // 5.1 Checkout (Cart to Order)
    toCheckout: (token, couponCode, fullName, phone, email, address, note, total, finalTotal, products, shippingMethod) => {
        if (token) {
            console.log(couponCode, fullName, phone, email, address, note, total, finalTotal, products, shippingMethod);
            const { username } = jwtDecode(token).user;
            return fetch({
                method: "POST",
                reqBody: {
                    username,
                    couponCode,
                    fullName,
                    phone,
                    email,
                    address,
                    note,
                    total,
                    finalTotal,
                    products,
                    shippingMethod
                },
                jwtToken: token,
                route: API_CHECKOUT
            });
        } else return null;
    },

    // 5.2 Get all orders
    getAllOrders: (token, limit, offset, query) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    limit,
                    offset,
                    query
                },
                jwtToken: token,
                route: API_CHECKOUT_ORDER
            });
        } else return null;
    },

    // 5.3 Get one order
    getOneOrder: (token, orderId) => {
        return fetch({
            method: "POST",
            reqBody: {
                orderId
            },
            jwtToken: token,
            route: API_CHECKOUT_ORDERDETAIL
        });
    },

    // 5.4 Check Coupon status
    getCouponStatus: coupon => {
        return fetch({
            method: "POST",
            reqBody: {
                coupon
            },
            jwtToken: localStorage.getItem("authToken"),
            route: API_CHECKOUT_COUPONSTT
        });
    },

    // 5.5 Get zptranstoken from orderid
    getZPTokenFromOrder: (token, orderId) => {
        return fetch({
            method: "POST",
            reqBody: {
                orderId
            },
            jwtToken: token,
            route: apiPrefix.checkout + "/checkorder"
        });
    },

    /*
     *       SECTION 6: ADMIN
     */

    // 6.1 Get all accounts
    adminGetAllAccounts: (token, offset, limit, { keyword }) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    limit,
                    offset,
                    query: {
                        keyword
                    }
                },
                jwtToken: token,
                route: API_USERS_ADMIN_GET
            });
        } else return null;
    },

    // 6.2 Create account
    adminCreateAccount: (token, { username, password, email, fullName, dateOfBirth, phone, gender, address, avatar, permission }) => {
        return fetch({
            method: "POST",
            reqBody: {
                username,
                password,
                email,
                fullName,
                dateOfBirth,
                phone,
                gender,
                address,
                avatar,
                permission
            },
            jwtToken: token,
            route: API_USERS_ADMIN_ADD
        });
    },

    // 6.3 Update account
    adminUpdateAccount: (
        token,
        id,
        { username, password, email, fullName, dateOfBirth, phone, gender, address, avatar, permission, active }
    ) => {
        if (token) {
            return fetch({
                method: "PUT",
                reqBody: {
                    id,
                    username,
                    password,
                    email,
                    fullName,
                    dateOfBirth,
                    phone,
                    gender,
                    address,
                    avatar,
                    permission,
                    active
                },
                jwtToken: token,
                route: API_USERS_ADMIN_UPDATE
            });
        } else return null;
    },

    // 6.4 Get all products
    adminGetAllProducts: (token, limit, offset, { keyword }) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    limit,
                    offset,
                    query: {
                        keyword
                    }
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_ALL
            });
        } else return null;
    },

    // 6.5 Insert product
    adminInsertProduct: (token, { product_name, industry_id, branch_id, category_id, brand_id, price, images, description, amount }) => {
        return fetch({
            method: "POST",
            reqBody: {
                product_name,
                industry_id,
                branch_id,
                category_id,
                brand_id,
                price,
                images,
                description,
                amount
            },
            jwtToken: token,
            route: API_PRODUCT_ADMIN_ADD
        });
    },

    // 6.6 Update product
    adminUpdateProduct: (
        token,
        id,
        { product_name, industry_id, branch_id, category_id, brand_id, price, images, description, longDescription, amount, active }
    ) => {
        if (token) {
            return fetch({
                method: "PUT",
                reqBody: {
                    id,
                    product_name,
                    industry_id,
                    branch_id,
                    category_id,
                    brand_id,
                    price,
                    images,
                    description,
                    longDescription,
                    amount,
                    active
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_UPDATE
            });
        } else return null;
    },

    // 6.7 Get all brands
    adminGetAllBrands: (token, limit, offset, query) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    limit,
                    offset,
                    query: {
                        ...query
                    }
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_BRAND_ALL
            });
        } else return null;
    },

    adminGetAllBrandsBrand: (token, limit, offset, query) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    limit,
                    offset,
                    query: {
                        ...query
                    }
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_BRAND_BRAND
            });
        } else return null;
    },

    // 6.8 Insert brand
    adminInsertBrand: (token, { brand_name }) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    brand_name
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_BRAND_ADD
            });
        } else return null;
    },

    // 6.9 Update brand
    adminUpdateBrand: (token, id, { brand_name, active }) => {
        if (token) {
            return fetch({
                method: "PUT",
                reqBody: {
                    id,
                    brand_name,
                    active
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_BRAND_UPDATE
            });
        } else return null;
    },

    // 6.10 Get all industries
    adminGetAllIndustries: (token, limit, offset, { keyword }) => {
        return fetch({
            method: "POST",
            reqBody: {
                limit,
                offset,
                query: {
                    keyword
                }
            },
            jwtToken: token,
            route: API_PRODUCT_ADMIN_INDUSTRY_ALL
        });
    },

    // 6.11 Insert  industry
    adminInsertIndustry: (token, { industryName }) => {
        return fetch({
            method: "POST",
            reqBody: {
                industryName
            },
            jwtToken: token,
            route: apiPrefix.admin + "/industry/insert"
        });
    },

    // 6.12 Update industry
    adminUpdateIndustry: (token, id, { industryName, active }) => {
        return fetch({
            method: "POST",
            reqBody: {
                id,
                industryName,
                active
            },
            jwtToken: token,
            route: apiPrefix.admin + "/industry/update"
        });
    },

    // 6.13 Get all Branches
    adminGetAllBranches: (token, limit, offset, { keyword }) => {
        if (token) {
            return fetch({
                method: "POST",
                reqBody: {
                    limit,
                    offset,
                    query: {
                        keyword
                    }
                },
                jwtToken: token,
                route: API_PRODUCT_ADMIN_BRANCH_ALL
            });
        } else return null;
    },

    // 6.14 Insert branch
    adminInsertBranch: (token, { branchName, industryId }) => {
        return fetch({
            method: "POST",
            reqBody: {
                branchName,
                industryId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/branch/insert"
        });
    },

    // 6.15 Update branch
    adminUpdateBranch: (token, id, { branchName, industryId, active }) => {
        return fetch({
            method: "POST",
            reqBody: {
                id,
                branchName,
                industryId,
                active
            },
            jwtToken: token,
            route: apiPrefix.admin + "/branch/update"
        });
    },

    // 6.16 Get all Categories
    adminGetAllCategories: (token, limit, offset, { keyword }) => {
        return fetch({
            method: "POST",
            reqBody: {
                limit,
                offset,
                query: {
                    keyword
                }
            },
            jwtToken: token,
            route: API_PRODUCT_ADMIN_CATEGORY_ALL
        });
    },

    // 6.17 Insert category
    adminInsertCategory: (token, { categoryName, industryId, branchId }) => {
        return fetch({
            method: "POST",
            reqBody: {
                categoryName,
                industryId,
                branchId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/category/insert"
        });
    },

    // 6.18 Update category
    adminUpdateCategory: (token, id, { categoryName, branchId, industryId, active }) => {
        return fetch({
            method: "POST",
            reqBody: {
                id,
                categoryName,
                industryId,
                branchId,
                active
            },
            jwtToken: token,
            route: apiPrefix.admin + "/category/update"
        });
    },

    // 6.19 Get all Campaigns
    adminGetAllCampaigns: (token, limit, offset, { keyword, startTime, expiredTime }) => {
        return fetch({
            method: "GET",
            reqBody: {
                limit,
                offset,
                query: {
                    keyword,
                    startTime,
                    expiredTime
                }
            },
            jwtToken: token,
            route: apiPrefix.admin + "/campaign/all"
        });
    },

    // 6.20 Insert campaign
    adminInsertCampaign: (token, { campaignName, description, startTime, expiredTime }) => {
        return fetch({
            method: "POST",
            reqBody: {
                campaignName,
                description,
                startTime,
                expiredTime
            },
            jwtToken: token,
            route: apiPrefix.admin + "/campaign/insert"
        });
    },

    // 6.21 Update campaign
    adminUpdateCampaign: (token, id, { campaignName, description, startTime, expiredTime, active }) => {
        return fetch({
            method: "POST",
            reqBody: {
                id,
                campaignName,
                description,
                startTime,
                expiredTime,
                active
            },
            jwtToken: token,
            route: apiPrefix.admin + "/campaign/update"
        });
    },

    // 6.22 Get all Coupons
    adminGetAllCoupons: (token, limit, offset, { startTime, expiredTime }) => {
        return fetch({
            method: "GET",
            reqBody: {
                limit,
                offset,
                query: {
                    startTime,
                    expiredTime
                }
            },
            jwtToken: token,
            route: apiPrefix.admin + "/coupon/all"
        });
    },

    // 6.23 Insert coupon
    adminInsertCoupon: (token, productsId, { campaignId, couponCode, percent, money, threshold, allProduct, amount }) => {
        return fetch({
            method: "POST",
            reqBody: {
                campaignId,
                couponCode,
                percent,
                money,
                threshold,
                allProduct,
                amount,
                productsId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/coupon/insert"
        });
    },

    // 6.24 Update coupon
    adminUpdateCoupon: (token, productsId, { campaignId, couponCode, percent, money, threshold, allProduct, amount, active }) => {
        return fetch({
            method: "POST",
            reqBody: {
                campaignId,
                couponCode,
                percent,
                money,
                threshold,
                allProduct,
                amount,
                active,
                productsId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/coupon/update"
        });
    },

    // 6.25 Get all discounts
    adminGetAllDiscounts: (token, limit, offset, { startTime, expiredTime }) => {
        return fetch({
            method: "GET",
            reqBody: {
                limit,
                offset,
                query: {
                    startTime,
                    expiredTime
                }
            },
            jwtToken: token,
            route: apiPrefix.admin + "/discount/all"
        });
    },

    // 6.26 Insert discount
    adminInsertdiscount: (token, productsId, { percent, startTime, expiredTime }) => {
        return fetch({
            method: "POST",
            reqBody: {
                percent,
                startTime,
                expiredTime,
                productsId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/discount/insert"
        });
    },

    // 6.27 Update discount
    adminUpdatediscount: (token, productsId, { percent, startTime, expiredTime, active }) => {
        return fetch({
            method: "POST",
            reqBody: {
                percent,
                startTime,
                expiredTime,
                active,
                productsId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/discount/update"
        });
    },

    // 6.28 Get all Orders
    adminGetAllOrders: (token, limit, offset, { startTime, expiredTime }) => {
        return fetch({
            method: "POST",
            reqBody: {
                limit,
                offset,
                query: {
                    startTime,
                    expiredTime
                }
            },
            jwtToken: token,
            route: API_CHECKOUT_ADMIN_ORDER
        });
    },

    // 6.29 GET one order
    adminGetOrder: (token, orderId) => {
        return fetch({
            method: "GET",
            reqBody: {
                orderId
            },
            jwtToken: token,
            route: apiPrefix.admin + "/order/one"
        });
    },

    // 6.30 Change order status
    admimChangeOrderStatus: (token, orderId, status) => {
        if (token) {
            return fetch({
                method: "PUT",
                reqBody: {
                    orderId,
                    status
                },
                jwtToken: token,
                route: API_CHECKOUT_ORDER_UPDATE
            });
        } else return null;
    },

    /*
     *       SECTION 6: ADMIN
     */
    // 7.1 Get zalopay order status
    getZalopayOrderStatus: (token, orderId) => {
        return fetch({
            method: "POST",
            reqBody: {
                orderId
            },
            jwtToken: token,
            route: apiPrefix.zalopay + "/order"
        });
    }
};
