import dotenv from "dotenv";
import { Main } from "./main";
import ImageController from "./modules/image/image-controller";

dotenv.config();

const port = process.env.PORT || 8080;
const app = new Main([new ImageController()], port);

app.listen();
