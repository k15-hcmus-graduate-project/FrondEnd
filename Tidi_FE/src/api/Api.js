// @flow
import axios from "axios";
import StorageService from "../services/StorageService";

class Api {
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

    static getLocationTest(path: string) {
        // const token = localStorage.getItem("authToken");
        // const config = {
        //     headers: {
        //         "Content-Type": "text/javascript; charset=utf-8",
        //         "content-encoding": "gzip"
        //     },
        //     params: {
        //         searchtext: "182 Le Dai Hanh, q11, tp HCM",
        //         app_id: "devportal-demo-20180625",
        //         app_code: "9v2BkviRwi9Ot26kp2IysQ",
        //         gen: 9
        //     },
        //     timeout: 10000
        // };
        // return axios
        //     .get(`${path}`, config)
        //     .then(res => {
        //         if (res.data) return res.data;
        //         return res;
        //     })
        //     .catch(error => {
        //         throw error;
        //     });
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
}

export default Api;
