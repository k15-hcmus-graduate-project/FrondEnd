// @flow
import axios from "axios";
import StorageService from "../services/StorageService";

class Api {
    static post(path: string, data: Object) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000
        };
        return axios
            .post(`${path}`, data, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }

    static postFormData(path: string, data: Object) {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data;boundary=gc0p4Jq0M2Yt08jU534c0p",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000
        };
        return axios
            .post(`${path}`, data, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }

    static postFileWithData(path: string, data: Object, paramsData: Object) {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data;boundary=gc0p4Jq0M2Yt08jU534c0p",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000,
            params: paramsData
        };
        return axios
            .post(`${path}`, data, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }

    static putFormData(path: string, data: Object) {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data;boundary=gc0p4Jq0M2Yt08jU534c0p",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000
        };
        return axios
            .put(`${path}`, data, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }

    static postToken(path: string, data: Object, config: Object) {
        return axios
            .post(`${path}`, data, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }

    static get(path: string) {
        const token = localStorage.getItem("authToken");
        const config = {
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            timeout: 10000
        };

        return axios
            .get(`${path}`, config)
            .then(res => {
                if (res.data) return res.data;
                return res;
            })
            .catch(error => {
                throw error;
            });
    }

    static getWithParams(path: string, paramsData: Object) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000,
            params: paramsData
        };

        return axios
            .get(`${path}`, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }

    static downloadFile(path: string, paramsData: Object, responseType: String) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000,
            params: paramsData,
            responseType
        };

        return axios
            .get(`${path}`, config)
            .then(res => res)
            .catch(error => {
                throw error;
            });
    }
    static getFreshToken(path: string) {
        const token = localStorage.getItem("refreshToken");
        const config = {
            headers: {
                "Content-Type": "application/json",
                "x-refresh-token": token
            }
        };

        return axios
            .get(`${path}`, config)
            .then(res => {
                if (res.data) return res.data;
                return res;
            })
            .catch(error => {
                throw error;
            });
    }
    static putWithParams(path: string, paramsData: Object) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000,
            params: paramsData
        };

        return axios
            .get(`${path}`, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }
    static getWithQuerys(path: string, paramsData: Object) {
        const strQuery = JSON.stringify(paramsData);

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000,
            params: {
                query: `${strQuery}`
            }
        };

        return axios
            .get(`${path}`, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }
    static throwError(status: String, error: String, message: String) {
        const errorObj = {
            status,
            error,
            message
        };
        throw errorObj;
    }

    static put(path: string, data: Object) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${StorageService.getToken()}`
            },
            timeout: 10000
        };

        return axios
            .put(`${path}`, data, config)
            .then(res => res.data)
            .catch(error => {
                throw error;
            });
    }
}

export default Api;
