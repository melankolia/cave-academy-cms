import {
  VISITATION,
  VISITATION_SALES_SEARCH,
  VISITATION_STORES_SEARCH,
} from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class VisitationService extends Instance {
  list(params = null) {
    return super.query(VISITATION, { params });
  }

  details(secureId) {
    return super.fetch(VISITATION, secureId);
  }

  searchSales(query) {
    return super.query(VISITATION_SALES_SEARCH, {
      params: { query },
    });
  }

  searchStores(query) {
    return super.query(VISITATION_STORES_SEARCH, {
      params: { query },
    });
  }
}

export default VisitationService;
