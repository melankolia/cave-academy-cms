import { FILE_UPLOAD } from "./Instance/constants";
import Instance from "./Instance/MainInstance";

class FileUploadService extends Instance {
  upload(data) {
    return super.post(FILE_UPLOAD, data);
  }
}

export default FileUploadService;
