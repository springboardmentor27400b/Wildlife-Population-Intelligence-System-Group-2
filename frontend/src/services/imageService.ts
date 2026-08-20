import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/upload/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}