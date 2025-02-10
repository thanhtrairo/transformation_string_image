import dotenv from "dotenv";
import { Main } from "./main";
import ImageController from "./modules/image/image-controller";
import TransformationController from "./modules/transformation/transformation-controller";

dotenv.config();

const port = process.env.PORT || 8080;
const app = new Main(
  [new ImageController(), new TransformationController()],
  port
);
app.listen();
