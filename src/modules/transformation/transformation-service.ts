import fs from "fs";

import {
  CROP_TYPES,
  EFFECT_TYPES,
  FORMAT_TYPES,
  ITransformationService,
  Params,
  QUALITY_RANGES,
  QueryParams,
  TTransformation,
} from "./transformation-type";
import { HTTP_STATUS, HttpException } from "../../utils/http-exception";
import sharp, { FormatEnum } from "sharp";
import path from "path";

export default class TransformationService implements ITransformationService {
  private static instance: TransformationService;
  private transformations: TTransformation[] = [];
  private static readonly DIRECTOR = "public/images/";
  private readonly WIDTH_RANGES = {
    "100": "small",
    "160": "compact",
    "240": "medium",
    "480": "large",
    "600": "grande",
    "1039": "master",
  };
  private readonly CROP_TYPES = [CROP_TYPES.contain, CROP_TYPES.cover];
  private readonly FORMAT_TYPES = [
    FORMAT_TYPES.webp,
    FORMAT_TYPES.jpg,
    FORMAT_TYPES.png,
  ];
  private readonly EFFECT_TYPES = [
    EFFECT_TYPES.none,
    EFFECT_TYPES.grayscale,
    EFFECT_TYPES.blur,
  ];

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
    if (typeof newWidth !== "number" || isNaN(newWidth)) {
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
    if (typeof newQuality !== "number" || isNaN(newQuality)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid quality");
    }
    if (newQuality < QUALITY_RANGES.min || newQuality > QUALITY_RANGES.max) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        "Width quality too large"
      );
    }
    return newQuality;
  }

  private handleCropTypeParams(cropType?: CROP_TYPES) {
    if (!cropType) {
      return null;
    }
    if (!this.CROP_TYPES.includes(cropType)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid crop type");
    }
    return cropType;
  }

  private handleEffectParams(effect?: EFFECT_TYPES) {
    if (!effect) {
      return null;
    }
    if (!this.EFFECT_TYPES.includes(effect)) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, "Invalid effect");
    }
    return effect;
  }

  private handleFormatParams(format?: FORMAT_TYPES) {
    if (!format || !this.FORMAT_TYPES.includes(format)) {
      return this.FORMAT_TYPES[0];
    }
    return format;
  }

  private transformParams({ w, q, e, c, f }: QueryParams, imageId: string) {
    const widthProcessed = this.handleWidthParams(w);
    const qualityProcessed = this.handleQualityParams(q);
    const cropTypeProcessed = this.handleCropTypeParams(c);
    const effectProcessed = this.handleEffectParams(e);
    const formatProcessed = this.handleFormatParams(f);
    let str = `w=${widthProcessed.range}&q=${qualityProcessed}`;
    if (effectProcessed) {
      str += `&e=${effectProcessed}`;
    }
    if (cropTypeProcessed) {
      str += `&c=${cropTypeProcessed}`;
    }
    str += `${imageId}.${formatProcessed}`;

    return {
      str,
      transformedParams: {
        width: widthProcessed,
        quality: qualityProcessed,
        cropType: cropTypeProcessed,
        effect: effectProcessed,
        format: formatProcessed,
      },
    };
  }

  async transformationString(
    query: QueryParams,
    { filename, imageId }: Params
  ) {
    if (!filename || !query.w || !query.q) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        "filename or width or quality not found"
      );
    }

    const {
      str,
      transformedParams: { cropType, effect, format, quality, width },
    } = this.transformParams(query, imageId);

    const outputPath = path.join(__dirname, "../../../public/images", str);

    if (fs.existsSync(outputPath)) {
      return outputPath;
    }

    try {
      const inputFilePath = path.join(
        __dirname,
        "../../../public/uploads",
        filename
      );

      if (!fs.existsSync(inputFilePath)) {
        throw new HttpException(HTTP_STATUS.NOT_FOUND, "Input file is missing");
      }

      let image = sharp(inputFilePath);
      image = image
        .resize(width)
        .toFormat(format as keyof FormatEnum, { quality: quality });

      if (effect === EFFECT_TYPES.blur) {
        image = image.blur(5);
      } else if (effect === EFFECT_TYPES.grayscale) {
        image = image.grayscale();
      }

      if (cropType === CROP_TYPES.contain) {
        image = image.resize({ fit: sharp.fit.contain });
      } else if (cropType === CROP_TYPES.cover) {
        image = image.resize({ fit: sharp.fit.cover });
      }
      const newFile = await image.toFile(outputPath);
      const newTransformation: TTransformation = {
        id: Date.now() + "-" + Math.round(Math.random() * 1e9),
        imageId,
        name: str,
        path: outputPath,
        size: newFile.size,
        type: format,
      };
      this.transformations.push(newTransformation);

      return outputPath;
    } catch (error) {
      throw error;
    }
  }
}
