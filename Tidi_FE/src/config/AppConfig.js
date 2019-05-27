// // @flow
// export const API_BASE_URL = "http://10.50.1.6:9401"; // sandbox
export const API_BASE_URL = "http://localhost:5000"; // local
// export const API_BASE_URL = "http://10.50.1.6:9301"; // dev
export const CLIENT_ID = "testjwtclientid";
export const CLIENT_SECRET = "XY7kmzoNzl100";
export const GRANT_TYPE = "password";

// Users
export const API_USERS_ADD = "/users";
export const API_USERS_ADMIN_UPDATE = "/users/admin";
export const API_USERS_ADMIN_GET = "/users/admin";
export const API_USERS_ADMIN_ADD = "/users/admin/add";
export const API_USERS_ONE = "/users/one"; // USER_GET
export const API_USERS_CART_UPDATE = "/users/cartupdate";
export const API_USERS_LOGIN = "/users/login";

// Cart
export const API_USERS_CART = "/cart";

// Product
export const API_PRODUCT_INDUSTRY = "/product/industry";
export const API_PRODUCT_BRAND = "/product/brand";
export const API_PRODUCT_UPDATE_VIEWER = "/product/viewer";
export const API_PRODUCT_ALL = "/product/all";
export const API_PRODUCT_ADMIN_ALL = "/product/admin";
export const API_PRODUCT_ADMIN_ADD = "/product/admin/add";
export const API_PRODUCT_ADMIN_UPDATE = "/product/admin";
export const API_PRODUCT_ADMIN_BRAND_ALL = "/product/admin/brand";
export const API_PRODUCT_ADMIN_BRAND_BRAND = "/product/admin/brand/brand";
export const API_PRODUCT_ADMIN_BRAND_UPDATE = "/product/admin/brand";
export const API_PRODUCT_ADMIN_BRAND_ADD = "/product/admin/brand/add";
export const API_PRODUCT_ADMIN_INDUSTRY_ALL = "/product/admin/industry";
export const API_PRODUCT_ADMIN_BRANCH_ALL = "/product/admin/branch";
export const API_PRODUCT_ADMIN_CATEGORY_ALL = "/product/admin/category";

// Checkout
export const API_CHECKOUT_COUPONSTT = "/checkout/couponStatus";
export const API_CHECKOUT = "/checkout/checkout";
export const API_CHECKOUT_ORDER = "/checkout/order";
export const API_CHECKOUT_ORDERDETAIL = "/checkout/order/orderdetail";
export const API_CHECKOUT_ORDER_UPDATE = "/checkout/admin/order";
export const API_CHECKOUT_ADMIN_ORDER = "/checkout/admin/order";

// location
export const API_LOCATION_GET = "/location";
export const API_LOCATION_UPDATE = "/location";
export const API_LOCATION_USER_UPDATE = "/location/user";
export const API_LOCATION_USER_GET = "/location/user";
