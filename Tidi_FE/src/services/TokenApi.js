// @flow
import jwtDecode from "jwt-decode";
import api from "../api/Api";
import { API_BASE_URL } from "../config/AppConfig";

class TokenApi {
    static postVerifyToken() {
        const { user } = jwtDecode(localStorage.getItem("authToken"));
        return api.get(`${API_BASE_URL}/users/one/${user.username}`);
    }

    static postVerifyRefreshToken() {
        return api.getFreshToken(`${API_BASE_URL}/auth/access`);
    }
}

export default TokenApi;
