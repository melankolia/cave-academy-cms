import { EVENT } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class EventService extends Instance {
  create(data) {
    return super.post(EVENT, data);
  }

  update(data, id) {
    return super.update(EVENT, id, data);
  }

  list(params = null) {
    return super.query(EVENT, { params });
  }

  details(id) {
    return super.fetch(EVENT, id);
  }

  delete(id) {
    return super.deleteSlug(EVENT, id);
  }
}

export default EventService;
