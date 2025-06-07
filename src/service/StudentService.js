import { CHANGE_PASSWORD, STUDENT } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class StudentService extends Instance {
  create(data) {
    return super.post(STUDENT, data);
  }

  update(data, secureId) {
    return super.update(STUDENT, secureId, data);
  }

  updatePassword(data, secureId) {
    return super.post(CHANGE_PASSWORD + `/${secureId}`, data);
  }

  list(params = null) {
    return super.query(STUDENT, { params });
  }

  details(secureId) {
    return super.fetch(STUDENT, secureId);
  }

  delete(secureId) {
    return super.deleteSlug(STUDENT, secureId);
  }
}

export default StudentService;
