import express from "express";
import asyncHandler from "express-async-handler";

import { BaseController } from "../common/base-controller";
import ImageService from "./image-service";
import { IImageService } from "./image-type";
import ImageUploadMiddleware from "./image-upload-middleware";

export default class ImageController extends BaseController {
  private imageService: IImageService;

  public path = "/images";

  constructor() {
    super();
    this.imageService = ImageService.getInstance();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      "/upload",
      ImageUploadMiddleware.uploadSingle,
      asyncHandler(this.createImage.bind(this))
    );
  }

  private async createImage(req: express.Request, res: express.Response) {
    res.send(await this.imageService.upload(req.file));
  }
}
