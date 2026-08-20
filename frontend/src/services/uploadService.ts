import api from "./api";

export async function uploadImage(file: File, token: string) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/upload/image",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}