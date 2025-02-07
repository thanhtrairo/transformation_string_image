import asyncHandler from "express-async-handler";
import express from "express";

import { BaseController } from "../common/base-controller";
import TransformationService from "./transformation-service";
import { QueryParams } from "./transformation-type";

export default class TransformationController extends BaseController {
  private transformationService: TransformationService;

  public path = "/transformation";

  constructor() {
    super();
    this.transformationService = TransformationService.getInstance();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post("/", asyncHandler(this.transformationString.bind(this)));
  }

  private async transformationString(
    req: express.Request,
    res: express.Response
  ) {
    res.send(
      this.transformationService.transformationString(
        req.query as unknown as QueryParams
      )
    );
  }
}
