import { POSITION } from './Instance/constants';
import Instance from './Instance/MainInstance';

class PositionService extends Instance {
    create(data) {
        return super.post(POSITION, data);
    }

    update(data, secureId) {
        return super.update(POSITION, secureId, data);
    }

    list(params = null) {
        return super.query(POSITION, { params });
    }

    details(secureId) {
        return super.fetch(POSITION, secureId);
    }

    delete(secureId) {
        return super.deleteSlug(POSITION, secureId);
    }
}

export default PositionService;
