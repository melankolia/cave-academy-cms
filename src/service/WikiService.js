import { WIKI } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class WikiService extends Instance {
  create(data) {
    return super.post(WIKI, data);
  }

  update(data, secureId) {
    return super.update(WIKI, secureId, data);
  }

  list(params = null) {
    return super.query(WIKI, { params });
  }

  details(secureId) {
    return super.fetch(WIKI, secureId);
  }

  delete(secureId) {
    return super.deleteSlug(WIKI, secureId);
  }
}

export default WikiService;
