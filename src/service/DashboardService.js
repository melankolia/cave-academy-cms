import { ACTIVE_STUDENTS } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class DashboardService extends Instance {
  activeStudentsCountPerCourse() {
    return super.query(ACTIVE_STUDENTS);
  }
}

export default DashboardService;
