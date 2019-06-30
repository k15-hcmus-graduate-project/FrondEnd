export default {
    REST_SERVER: "http://localhost:5000",
    // REST_SERVER: 'http://tidi-binpossible49.c9users.io:8080/api/v1',
    DATE_FORMAT: "YYYY-MM-DD",
    APPID: 12606
};

export const QUERY_PARAMS = {
    keyword: "q",
    industryId: "ind",
    branchId: "brch",
    categoryId: "cat",
    brandId: "brd",
    minPrice: "pfrom",
    maxPrice: "pto"
};

export const ACTIVE_TYPE = {
    TRUE: "TRUE",
    FALSE: "FALSE"
};

export const USER_TYPE = {
    ADMIN: "ADMIN",
    CUSTOMER: "CUSTOMER",
    PUBLIC: "PUBLIC"
};

export const USER_GENDER = {
    MALE: "MALE",
    FEMALE: "FEMALE"
};

export const ORDER_STATUS = {
    PENDING: "PENDING",
    CHECKED: "CHECKED",
    PACKING: "PACKING",
    SHIPPING: "SHIPPING",
    CANCELED: "CANCELED",
    SUCCESSFUL: "SUCCESSFUL",
    PAID: "PAID"
};

// export const ORDER_STATUS = {
//     PENDING: 'PENDING',
//     PAID: 'PAID',
//     SHIPPING: 'SHIPPING',
//     CANCELED: 'CANCELED',
//     SUCCESSFUL: 'SUCCESSFUL'
// }

export const VERIFICATION_TYPE = {
    EMAIL: "EMAIL",
    PASSWORD: "PASSWORD"
};

export const DEFAULT_FORMDATA = {
    AdminAddUser: {
        id: "",
        username: "",
        permission: USER_TYPE.CUSTOMER,
        email: "",
        fullName: "",
        dateOfBirth: "",
        phone: "",
        gender: USER_GENDER.MALE,
        address: "",
        active: ACTIVE_TYPE.TRUE,
        password: ""
    },

    AdminAddProduct: {
        id: "",
        product_name: "",
        brand_id: 1,
        industry_id: 1,
        branch_id: 1,
        category_id: 1,
        price: 0,
        images: '["https://www.twsf.com.tw/taipei/images/default.jpg"]',
        description: "",
        amount: 0,
        stock: 0,
        new_amount: 0,
        active: ACTIVE_TYPE.TRUE
    },
    AdminAddStore: {
        id: "",
        product_name: "",
        store: 1,
        store_name: "",
        store_address: ""
    },

    AdminAddBrand: {
        id: "",
        brand_name: ""
    }
};

export const PAYMENT_METHOD = [
    // {
    //     ID: 0,
    //     NAME: "ZaloPay",
    //     DESCRIPTION: "FREE and PROFESSIONL payment method",
    //     SHIPPING_FEE: 0
    // },
    {
        ID: 1,
        NAME: "Ship COD",
        DESCRIPTION: "Pay when deliver",
        SHIPPING_FEE: 19000
    }
];

export const ZP_ORDER_STATUS = {
    PROCESSING: "PROCESSING",
    CANCELED: "CANCELED",
    SUCCESSFUL: "SUCCESSFUL"
};
export const here = {
    app_id: "XWlu7av4mIl9LiVOkizU",
    app_code: "SWPg1es3nHq226fb1B6DMQ",
    useHTTPS: true
};
export const environment = {
    production: false,
    PARSE_APP_ID: "yf0epfCPMF1RxeR3kc6VdpDFb2qpE7pQgpLiGsG7",
    PARSE_JS_KEY: "Lh1WCK66TzgUR80NhQ736NQvOrzil2cWhZnyU4XY",
    masterKey: "OzV3QnIefjbn14kyEEVMcOQs2o7kxWNSk0I6SW7e",
    serverURL: "https://parseapi.back4app.com/",
    liveQueryServerURL: "wss://sang.back4app.io"
};
