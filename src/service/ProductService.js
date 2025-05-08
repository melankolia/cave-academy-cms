import { PRODUCT_STOCK } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class NewsService extends Instance {
  create(data) {
    return super.post(PRODUCT_STOCK, data);
  }

  update(data, secureId) {
    return super.update(PRODUCT_STOCK, secureId, data);
  }

  list(params = null) {
    return super.query(PRODUCT_STOCK, { params });
  }

  details(secureId) {
    return super.fetch(PRODUCT_STOCK, secureId);
  }

  delete(secureId) {
    return super.deleteSlug(PRODUCT_STOCK, secureId);
  }
}

export default NewsService;
