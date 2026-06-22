import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import formidable from "formidable";
import type { Fields, Files } from "formidable";
import Cloudinary from "cloudinary";
import { authOptions } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

Cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err: Error | null, _fields: Fields, files: Files) => {
    if (err) return res.status(500).json({ message: "Upload error" });
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ message: "No file" });

    const result = await Cloudinary.v2.uploader.upload(file.filepath, { folder: "derpx06" });
    return res.status(200).json({ url: result.secure_url });
  });
}
