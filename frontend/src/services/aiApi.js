import axios from "axios";

const AI_API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default AI_API;