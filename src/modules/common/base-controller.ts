import express from "express";

export abstract class BaseController {
  constructor() {
    this.router = express.Router();
  }

  public router: express.Router;

  public abstract initializeRoutes(): void;

  public abstract path: string;
}
