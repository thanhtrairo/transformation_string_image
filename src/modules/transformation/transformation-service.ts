import fs from "fs";

import {
  ITransformationService,
  QueryParams,
  TTransformation,
} from "./transformation-type";
import { HTTP_STATUS, HttpException } from "../../ultils/http-exception";
import sharp, { FormatEnum } from "sharp";
import path from "path";

export default class TransformationService implements ITransformationService {
  private static instance: TransformationService;
  private transformImages: TTransformation[] = [];
  private static readonly DIRECTOR = "public/images/";
  private readonly WIDTH_RANGES = {
    "100": "small",
    "160": "compact",
    "240": "medium",
    "480": "large",
    "600": "grande",
    "1039": "master",
  };
  private readonly QUALITY_RANGES = {
    min: 1,
    max: 100,
  };
  private readonly CROP_TYPES = ["contain", "cover"];
  private readonly FORMAT_TYPES = ["webp", "png", "jpg"];
  private readonly EFFECT_TYPES = ["none", "grayscale", "blur"];

  constructor() {
    this.ensureDir(TransformationService.DIRECTOR);
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  static getInstance(): TransformationService {
    if (!TransformationService.instance) {
      TransformationService.instance = new TransformationService();
    }
    return TransformationService.instance;
  }

  private handleWidthParams(width: string) {
    const newWidth = parseInt(width);
    if (typeof newWidth !== "number" || !isNaN(newWidth)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid width");
    }
    for (let key in this.WIDTH_RANGES) {
      if (newWidth <= Number(key)) {
        return {
          width: newWidth,
          range: this.WIDTH_RANGES[key as keyof typeof this.WIDTH_RANGES],
        };
      }
    }
    throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Width range too large");
  }

  private handleQualityParams(quality: string) {
    const newQuality = parseInt(quality);
    if (typeof newQuality !== "number" || !isNaN(newQuality)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid quality");
    }
    if (
      newQuality >= this.QUALITY_RANGES.min &&
      newQuality <= this.QUALITY_RANGES.max
    ) {
      return newQuality;
    }
    throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Width quality too large");
  }

  private handleCropTypeParams(cropType?: string) {
    if (!cropType) {
      return null;
    }
    if (!this.CROP_TYPES.includes(cropType)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid crop type");
    }
    return cropType;
  }

  private handleEffectParams(effect?: string) {
    if (!effect) {
      return null;
    }
    if (!this.EFFECT_TYPES.includes(effect)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid effect");
    }
    return effect;
  }

  private handleFormatParams(format?: string) {
    if (!format || !this.FORMAT_TYPES.includes(format)) {
      return this.FORMAT_TYPES[0];
    }
    return format;
  }

  private transformParams({
    width,
    quality,
    effect,
    cropType,
    format,
  }: QueryParams) {
    const widthTras = this.handleWidthParams(width);
    const qualityTras = this.handleQualityParams(quality);
    const cropTypeTras = this.handleCropTypeParams(cropType);
    const effectTras = this.handleEffectParams(effect);
    const formatTras = this.handleFormatParams(format);
    let str = `w=${widthTras.range}&q=${qualityTras}`;
    if (effectTras) {
      str += `&e=${effectTras}`;
    }
    if (cropTypeTras) {
      str += `&c=${cropTypeTras}`;
    }
    str += `.${formatTras}`;

    return {
      str,
      transformedParams: {
        width: widthTras,
        quality: qualityTras,
        cropType: cropTypeTras,
        effect: effectTras,
        format: formatTras,
      },
    };
  }

  async transformationString(query: QueryParams) {
    if (!query.fileName || !query.width || !query.quality) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        "fileName or width or quality not found"
      );
    }

    const {
      str,
      transformedParams: { cropType, effect, format, quality, width },
    } = this.transformParams(query);

    const outputPath = path.join(__dirname, "../../public/images", str);
    console.log("outputPath", outputPath);

    if (fs.existsSync(outputPath)) {
      return outputPath;
    }

    try {
      const inputFilePath = path.join(
        __dirname,
        "../../public/uploads",
        query.fileName
      );

      let image = sharp(inputFilePath);

      image = image
        .resize(width)
        .toFormat(format as keyof FormatEnum, { quality: quality });

      if (effect === this.EFFECT_TYPES[0]) {
        image = image.blur(5);
      } else if (effect === this.EFFECT_TYPES[1]) {
        image = image.grayscale();
      }

      if (cropType === "contain") {
        image = image.resize({ fit: sharp.fit.contain });
      } else if (cropType === "cover") {
        image = image.resize({ fit: sharp.fit.cover });
      }

      await image.toFile(outputPath);
      return outputPath;
    } catch (error) {
      throw new HttpException(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Error processing image: " + (error as Error).message
      );
    }
  }
}
