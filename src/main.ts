import express from "express";
import { BaseController } from "./modules/common/base-controller";
import { errorHandler, notFound } from "./middleware/error";

export class Main {
  private app: express.Application;
  private port: number | string;

  constructor(controllers: BaseController[], port: number | string) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
  }

  private initializeControllers(controllers: BaseController[]) {
    this.app.use("/static", express.static("public/uploads"));
    this.app.get("/", (_req, res) => {
      res.send("Application is running");
    });
    controllers.forEach(({ path, router }) => {
      this.app.use(path, router);
    });
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
