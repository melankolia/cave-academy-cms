import { BOARD } from './Instance/constants';
import Instance from './Instance/MainInstance';

class BoardService extends Instance {
    create(data) {
        return super.post(BOARD, data);
    }

    update(data, secureId) {
        return super.update(BOARD, secureId, data);
    }

    list(params = null) {
        return super.query(BOARD, { params });
    }

    details(secureId) {
        return super.fetch(BOARD, secureId);
    }

    delete(secureId) {
        return super.deleteSlug(BOARD, secureId);
    }
}

export default BoardService;
