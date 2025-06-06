import { NEWS } from './Instance/constants';
import Instance from './Instance/MainInstance';

class NewsService extends Instance {
    create(data) {
        return super.post(NEWS, data);
    }

    update(data, id) {
        return super.update(NEWS, id, data);
    }

    list(params = null) {
        return super.query(NEWS, { params });
    }

    details(id) {
        return super.fetch(NEWS, id);
    }

    delete(id) {
        return super.deleteSlug(NEWS, id);
    }
}

export default NewsService;
