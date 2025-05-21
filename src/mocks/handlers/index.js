import { handlers as AuthHandlers } from "./Auth";
import { handlers as SalesManagementHandlers } from "./SalesManagement";
import { handlers as ProductHandlers } from "./Product";
import { handlers as ProductStock } from "./ProductStock";
import { handlers as VisitationHandlers } from "./Visitation";
import { handlers as UploadHandlers } from "./Upload";
import { handlers as CourseHandlers } from "./Course";

export const handlers = [
  ...AuthHandlers,
  ...SalesManagementHandlers,
  ...ProductHandlers,
  ...ProductStock,
  ...VisitationHandlers,
  ...UploadHandlers,
  ...CourseHandlers,
];
