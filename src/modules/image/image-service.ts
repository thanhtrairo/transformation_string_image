import { HTTP_STATUS, HttpException } from "../../ultils/http-exception";
import { IImageService, TImage } from "./image-type";

export default class ImageService implements IImageService {
  private static instance: ImageService;
  private images: TImage[] = [];

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  upload(file?: Express.Multer.File) {
    if (!file) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "file not found");
    }
    const newImage: TImage = {
      id: Date.now() + "-" + Math.round(Math.random() * 1e9),
      name: file.filename,
      size: file.size,
      type: file.mimetype,
      path: file.path,
    };
    this.images.push(newImage);
    return { message: "File uploaded successfully", image: newImage };
  }
}
