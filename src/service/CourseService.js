import { COURSE } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class CourseService extends Instance {
  create(data) {
    return super.post(COURSE, data);
  }

  update(data, secureId) {
    return super.update(COURSE, secureId, data);
  }

  list(params = null) {
    return super.query(COURSE, { params });
  }

  details(secureId) {
    return super.fetch(COURSE, secureId);
  }

  delete(secureId) {
    return super.deleteSlug(COURSE, secureId);
  }
}

export default CourseService;
