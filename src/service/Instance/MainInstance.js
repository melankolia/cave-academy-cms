import router from '@/router';
import { LOGIN } from '@/router/constants';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';

class Instance {
    constructor(baseURL, timeout = null) {
        this.instance = axios.create({
            baseURL: import.meta.env.BASE_URL,
            timeout
        });
        this.instance.CancelToken = axios.CancelToken;
        this.instance.isCancel = axios.isCancel;
        this.instance.interceptors.request.use(this.reqInterceptors);
        this.instance.interceptors.response.use((response) => response, this.resInterceptors.bind(this));
    }

    reqInterceptors(config) {
        const authStore = useAuthStore();
        config.headers.Authorization = `Bearer ${authStore.token}`;
        return config;
    }

    resInterceptors(error) {
        const { response } = error;

        if (response.status === 401) this.forceLogout();
        return Promise.reject(error);
    }

    logout() {
        const authStore = useAuthStore();

        authStore.forceLogout().then(() => {
            const loginpath = window.location.pathname;

            router.replace({
                name: LOGIN,
                query: { pathname: loginpath }
            });
        });
    }

    async query(resource, params) {
        return this.instance.get(resource, params);
    }

    async download(resource, params, type) {
        return this.instance.get(resource, { params, responseType: type });
    }

    async fetch(resource, slug = '', params = null) {
        return this.instance.get(`${resource}/${slug}`, params);
    }

    async post(resource, params, config) {
        return this.instance.post(`${resource}`, params, config);
    }

    async create(resource, slug = '', params = null, config = null) {
        return this.instance.post(`${resource}/${slug}`, params, config);
    }

    async update(resource, slug, params) {
        return this.instance.put(`${resource}/${slug}`, params);
    }

    async put(resource, params, config) {
        return this.instance.put(`${resource}`, params, config);
    }

    async delete(resource, config) {
        return this.instance.delete(resource, config);
    }

    async deleteSlug(resource, slug, config) {
        return this.instance.delete(`${resource}/${slug}`, config);
    }

    cancelRequest() {
        return this.instance.CancelToken;
    }
}

export default Instance;
