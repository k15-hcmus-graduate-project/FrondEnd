// @flow
import Types from "./types";
// import Api from "../../../api/Api";
// import { API_BASE_URL, API_PRODUCT_INDUSTRY } from "../../../config/AppConfig";
const fetchIndustries = payload => ({
    type: Types.FETCH_INDUSTRIES,
    payload
});

const switchIndustryHover = payload => ({
    type: Types.HOVER_INDUSTRY_CHANGE,
    payload
});

const showNotification = ({ message, type }) => ({
    type: Types.SHOW_NOTIFICATION,
    payload: {
        message,
        type
    }
});

export default {
    fetchIndustries,
    switchIndustryHover,
    showNotification
};
