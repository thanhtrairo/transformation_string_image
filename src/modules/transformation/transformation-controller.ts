import asyncHandler from "express-async-handler";
import express from "express";

import { BaseController } from "../common/base-controller";
import TransformationService from "./transformation-service";
import { Params, QueryParams } from "./transformation-type";

export default class TransformationController extends BaseController {
  private transformationService: TransformationService;

  public path = "/transformation";

  constructor() {
    super();
    this.transformationService = TransformationService.getInstance();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      "/:imageId/:filename",
      asyncHandler(this.transformationString.bind(this))
    );
  }

  private async transformationString(
    req: express.Request,
    res: express.Response
  ) {
    res.sendFile(
      await this.transformationService.transformationString(
        req.query as unknown as QueryParams,
        req.params as unknown as Params
      )
    );
  }
}
