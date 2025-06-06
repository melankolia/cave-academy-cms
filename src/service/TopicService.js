import { TOPIC } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class TopicService extends Instance {
  create(data) {
    return super.post(TOPIC, data);
  }

  update(data, secureId) {
    return super.update(TOPIC, secureId, data);
  }

  list(params = null) {
    return super.query(TOPIC, { params });
  }

  details(secureId) {
    return super.fetch(TOPIC, secureId);
  }

  delete(secureId) {
    return super.deleteSlug(TOPIC, secureId);
  }
}

export default TopicService;
