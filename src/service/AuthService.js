import { LOGIN, LOGOUT } from './Instance/constants';
import Instance from './Instance/MainInstance';

class AuthService extends Instance {
    login(data) {
        return super.post(LOGIN, data);
    }

    logout() {
        return super.post(LOGOUT);
    }
}

export default AuthService;
