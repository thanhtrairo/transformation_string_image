import multer from "multer";
import fs from "fs";

export default class ImageUploadMiddleware {
  private static readonly DESTINATION = "public/uploads/";
  private static readonly FILESIZE = 1024 * 1024 * 5;

  private static storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      fs.mkdir(
        ImageUploadMiddleware.DESTINATION,
        { recursive: true },
        (err) => {
          cb(err, ImageUploadMiddleware.DESTINATION);
        }
      );
    },
    filename: function (_req, file, cb) {
      const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniquePrefix + "-" + file.originalname);
    },
  });

  public static uploadSingle = multer({
    storage: ImageUploadMiddleware.storage,
    limits: { fileSize: ImageUploadMiddleware.FILESIZE },
  }).single("file");
}
