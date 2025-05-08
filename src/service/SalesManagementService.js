import { CHANGE_PASSWORD, SALES_MANAGEMENT } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class SalesManagementService extends Instance {
  create(data) {
    return super.post(SALES_MANAGEMENT, data);
  }

  update(data, secureId) {
    return super.update(SALES_MANAGEMENT, secureId, data);
  }

  updatePassword(data, secureId) {
    return super.post(CHANGE_PASSWORD + `/${secureId}`, data);
  }

  list(params = null) {
    return super.query(SALES_MANAGEMENT, { params });
  }

  details(secureId) {
    return super.fetch(SALES_MANAGEMENT, secureId);
  }

  delete(secureId) {
    return super.deleteSlug(SALES_MANAGEMENT, secureId);
  }
}

export default SalesManagementService;
