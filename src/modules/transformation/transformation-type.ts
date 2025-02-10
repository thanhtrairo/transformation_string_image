export const enum QUALITY_RANGES {
  min = 1,
  max = 100,
}

export const enum CROP_TYPES {
  contain = "contain",
  cover = "cover",
}

export const enum FORMAT_TYPES {
  webp = "webp",
  png = "png",
  jpg = "jpg",
}

export const enum EFFECT_TYPES {
  none = "none",
  grayscale = "grayscale",
  blur = "blur",
}

export interface QueryParams {
  w: string;
  q: string;
  e: EFFECT_TYPES;
  f: FORMAT_TYPES;
  c: CROP_TYPES;
}

export interface Params {
  imageId: string;
  filename: string;
}

export interface ITransformationService {
  transformationString(query: QueryParams, params: Params): Promise<string>;
}

export type TTransformation = {
  id: string;
  imageId: string;
  name: string;
  size: number;
  type: string;
  path: string;
};
