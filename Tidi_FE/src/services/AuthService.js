// Internal Dependencies
import ws from "./WebService";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import TokenApi from "./TokenApi";
import { USER_TYPE } from "./../config/constants";

const INTERNAL_CONFIG = {
    INTERVAL_DURATION: 1000,
    SWAL_TIMEOUT: 10000
};

export default {
    verifyToken: changeLoginStatus => {
        if (!localStorage.getItem("authToken")) {
            if (!localStorage.getItem("refreshToken")) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                changeLoginStatus(false);
                return;
            }
            TokenApi.postVerifyRefreshToken()
                .then(res => {
                    localStorage.setItem(res.access_token);
                })
                .catch(err => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("refreshToken");
                    // dispatch(logoutAction());
                    throw err;
                });
            return;
        }
        try {
            TokenApi.postVerifyToken()
                .then(resp => {
                    changeLoginStatus(true);
                })
                .catch(error => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("refreshToken");
                    changeLoginStatus(false);
                    throw error;
                });
        } catch (e) {
            localStorage.removeItem("authToken");
            changeLoginStatus(false);
            throw e;
        }
    },

    verifyTokenAdmin: () => {
        if (!localStorage.getItem("authToken")) {
            if (!localStorage.getItem("refreshToken")) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                return false;
            }
            TokenApi.postVerifyRefreshToken()
                .then(res => {
                    const { permission } = jwtDecode(res.access_token).user;
                    localStorage.setItem(res.access_token);
                    console.log(jwtDecode(res.access_token));
                    if (permission === USER_TYPE.ADMIN) return true;
                    return true;
                })
                .catch(err => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("refreshToken");
                    return false; // dispatch(logoutAction());
                });
            return true;
        }
        try {
            TokenApi.postVerifyToken()
                .then(resp => {
                    if (resp.permission === USER_TYPE.ADMIN) return true;
                    return false;
                })
                .catch(error => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("refreshToken");
                    return false;
                });
            return true;
        } catch (e) {
            localStorage.removeItem("authToken");
            return false;
        }
        // return true;
    },

    login: (username, password) => {
        return new Promise((resolve, reject) => {
            ws.login(username, password)
                .then(res => {
                    let auth = JSON.parse(res);
                    if (auth) {
                        if (auth.user && auth.user.active === "FALSE") {
                            Swal({
                                title: "Login Failure!!",
                                timer: INTERNAL_CONFIG.SWAL_TIMEOUT,
                                allowOutsideClick: false,
                                onOpen: () => {
                                    Swal.showLoading();
                                    Swal({
                                        type: "error",
                                        title: "Login Fail!!",
                                        text: `Your account has been blocked.`,
                                        onClose: () => {
                                            resolve(false);
                                        }
                                    });
                                }
                            }).then(modalInfo => {
                                if (modalInfo.dismiss === Swal.DismissReason.timer) {
                                    Swal({
                                        type: "question",
                                        title: "Noo...",
                                        text: `Server time out! Please try again later.`
                                    });
                                    resolve(false);
                                }
                            });

                            resolve(false);
                        } else if (auth.auth === true && auth.authToken && auth.refreshToken) {
                            localStorage.setItem("authToken", auth.authToken);
                            localStorage.setItem("refreshToken", auth.refreshToken);
                            // localStorage.setItem("role", auth.permission);
                            resolve(true);
                        }
                    }

                    resolve(false);
                })
                .catch(err => {
                    console.log("ERR AuthSerivce: " + err);
                });
        });
    },

    logout: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
    },

    isLoggedIn: () => {
        const authToken = localStorage.getItem("authToken");
        return new Promise((resolve, reject) => {
            if (!authToken) {
                resolve({
                    tokenIsValid: false
                });
            } else {
                const { user } = jwtDecode(authToken);
                if (!user) {
                    resolve({
                        tokenIsValid: false
                    });
                } else {
                    resolve({
                        tokenIsValid: true,
                        username: user.username,
                        permission: user.permission,
                        emailIsVerified: true
                    });
                }
            }
        });
    },

    saveToken: token => {
        console.log(token);
        localStorage.setItem("authToken", token);
    },
    saveRefreshToken: token => {
        console.log(token);
        localStorage.setItem("refreshToken", token);
    },

    getToken: () => {
        let authToken = localStorage.getItem("authToken");
        return new Promise((resolve, reject) => {
            ws.readAccountInfo(authToken).then(res => {
                let resObj = JSON.parse(res);
                if (resObj.status.status === "TRUE") {
                    resolve(authToken);
                } else {
                    resolve(null);
                }
            });
        });
    },

    getTokenUnsafe: () => {
        return localStorage.getItem("authToken");
    }
};
