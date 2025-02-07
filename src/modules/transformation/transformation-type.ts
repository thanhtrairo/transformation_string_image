export interface QueryParams {
  fileName: string;
  width: string;
  quality: string;
  effect: string;
  format: string;
  cropType: string;
}

export interface ITransformationService {
  transformationString(query: QueryParams): void;
}

export type TTransformation = {
  id: string;
  imageId: string;
  name: string;
  size: number;
  type: string;
  path: string;
};
