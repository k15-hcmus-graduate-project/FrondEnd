// @flow
import Types from "./types";
import { API_BASE_URL, API_USERS_ADD } from "../../../config/AppConfig";
import Api from "../../../api/Api";

const toggleCart = payload => ({
    type: Types.TOGGLE_CART,
    payload
});

const changePageInfo = payload => ({
    type: Types.CHANGE_PAGE_INFO,
    payload
});

const updateCartProduct = payload => {
    if (payload === null) {
        payload = [];
    }
    return {
        type: Types.UPDATE_CART_PRODUCTS,
        payload
    };
};

const updateAuthStatus = payload => ({
    type: Types.UPDATE_AUTH_STATUS,
    payload
});

const refreshCart = payload => ({
    type: Types.REFRESH_CART,
    payload
});

// const registerSuccess = res => ({
//     type: Types.REFRESH_CART,
//     payload
// });
export const register = (username, password, email, fullName, dateOfBirth, phone, gender, address, avatar) => (dispatch: any) => {
    Api.post(`${API_BASE_URL}${API_USERS_ADD}`, { username, password, email, fullName, dateOfBirth, phone, gender, address, avatar })
        .then(res => {
            console.log(res);
            // dispatch(registerSuccess(res));
        })
        .catch(err => {
            console.log(err);
        });
};
export default {
    toggleCart,
    changePageInfo,
    updateCartProduct,
    updateAuthStatus,
    refreshCart
};
