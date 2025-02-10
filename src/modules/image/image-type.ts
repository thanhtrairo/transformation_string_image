export type TImage = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
};

export type UploadRes = {
  message: string;
  image: TImage;
};

export interface IImageService {
  upload(file?: Express.Multer.File): Promise<UploadRes>;
}
