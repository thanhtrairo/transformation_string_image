export interface IImageService {
  upload(file?: Express.Multer.File): void;
}

export type TImage = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
};
