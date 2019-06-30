class StorageService {
    constructor() {
        this.storage = window.localStorage;
        this.form_key = "search_form";
        this.token_key = "token";
        this.userCount = "userOnSite";
    }

    getSearchData() {
        const data = this.storage.getItem(this.form_key) || false;
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }

    setSearchData(data) {
        if (data) {
            this.storage.setItem(this.form_key, JSON.stringify(data));
        }
    }

    removeSearchData() {
        this.storage.removeItem(this.form_key);
    }

    getToken() {
        return this.storage.getItem(this.token_key) || false;
    }

    setToken(token) {
        if (token) {
            this.storage.setItem(this.token_key, token);
        }
    }

    getUserCount() {
        return this.storage.getItem(this.userCount) || false;
    }

    setUserCount() {
        this.storage.setItem(this.userCount, 1);
    }

    setCloseUser() {
        this.storage.setItem(this.userCount, 2);
    }

    removeToken() {
        this.storage.removeItem(this.token_key);
    }

    removeUserCount() {
        this.storage.removeItem(this.userCount);
    }
}

export default new StorageService();
