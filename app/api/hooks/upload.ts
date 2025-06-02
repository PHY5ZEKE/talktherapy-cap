import { uploader } from "utils/http";
import type { HttpResponse, UploadResponse } from "types/response";

export const uploadFile = async (
  file: File
): Promise<HttpResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await uploader<UploadResponse>(
    "POST",
    "/api/upload/referral",
    formData
  );
  return response;
};
