import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file ke Cloudinary dari Buffer
 * @param buffer  - Buffer file
 * @param folder  - Folder di Cloudinary (e.g. "absensi", "pengaduan-bk")
 * @param filename - Nama file tanpa ekstensi
 * @returns URL file yang sudah diupload
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: "auto", // support PDF, gambar, dll
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload gagal"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;