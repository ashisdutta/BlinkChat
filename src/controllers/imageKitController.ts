import ImageKit from "imagekit";
import { type Request, type Response } from "express";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export const getAuthParams = (req: Request, res: Response) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
};
