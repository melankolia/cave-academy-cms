import { NEWS } from './Instance/constants';
import Instance from './Instance/MainInstance';

class NewsService extends Instance {
    create(data) {
        return super.post(NEWS, data);
    }

    update(data, secureId) {
        return super.update(NEWS, secureId, data);
    }

    list(params = null) {
        return super.query(NEWS, { params });
    }

    details(secureId) {
        return super.fetch(NEWS, secureId);
    }

    delete(secureId) {
        return super.deleteSlug(NEWS, secureId);
    }
}

export default NewsService;
