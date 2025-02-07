import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import sharp, { FormatEnum } from "sharp";
import asyncHandler from "express-async-handler";
import { TImage } from "../modules/image/image-type";
import { TTransformation } from "../modules/transformation/transformation-type";

const router = express.Router();
const images: TImage[] = [];
const transformImages: TTransformation[] = [];

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, _file, cb) {
      fs.mkdir("public/uploads/", () => {
        cb(null, "public/uploads/");
      });
    },
    filename: function (_req, file, cb) {
      const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniquePrefix + "-" + file.originalname);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.post(
  "/upload",
  asyncHandler(async (req: Request, res: Response) => {
    // Giả sử bạn cần kiểm tra file từ `req.file`
    if (!req.file) {
      throw new Error("File not found");
    }

    // Logic upload file khác ở đây...
    res.send("File uploaded successfully");
  })
);

// router.post(
//   "/upload",
//   upload.single("file"),
//   asyncHandler((req: Request, res: Response) => {
//     try {
//       const file = req.file;
//       if (!file) {
//         throw new Error("File not found");
//       }
//       console.log("file", file);
//       const newImage: TImage = {
//         id: Date.now() + "-" + Math.round(Math.random() * 1e9),
//         name: file.filename,
//         size: file.size,
//         type: file.mimetype,
//         path: file.path,
//       };
//       images.push(newImage);
//       res
//         .status(200)
//         .json({ message: "File uploaded successfully", filePath: file.path });
//     } catch (error) {
//       throw error;
//     }
//   })
// );

router.get("/transform", async (req: Request, res: Response) => {
  const { width, quality, effect, format, cropType, fileName } = req.query;

  if (!fileName || typeof fileName !== "string") {
    res.status(400).send("Missing or invalid fileName");
    return;
  }

  // Chuyển đổi tham số
  const widthInt = parseInt(width as string) || 800;
  const qualityInt = parseInt(quality as string) || 80;
  const effectOption = (effect as string) || "none";
  const formatOption = (format as keyof FormatEnum) || "webp";
  const cropOption = (cropType as string) || "cover";

  // Tạo tên file cache
  const transformStr = `w=${widthInt}&q=${qualityInt}&e=${effectOption}&c=${cropOption}.${formatOption}`;

  ensureDir("public/images");

  const outputPath = path.join(__dirname, "../../public/images", transformStr);
  console.log("outputPath", outputPath);

  if (fs.existsSync(outputPath)) {
    return res.sendFile(outputPath);
  }

  try {
    const inputFilePath = path.join(
      __dirname,
      "../../public/uploads",
      fileName
    );
    console.log("inputFilePath", inputFilePath);

    let image = sharp(inputFilePath);

    image = image
      .resize(widthInt)
      .toFormat(formatOption, { quality: qualityInt });

    if (effectOption === "blur") {
      image = image.blur(5);
    } else if (effectOption === "grayscale") {
      image = image.grayscale();
    }

    if (cropOption === "contain") {
      image = image.resize({ fit: sharp.fit.contain });
    } else if (cropOption === "cover") {
      image = image.resize({ fit: sharp.fit.cover });
    }

    await image.toFile(outputPath);
    res.sendFile(outputPath);
  } catch (error) {
    res.status(500).send("Error processing image: " + (error as Error).message);
  }
});

export default router;
