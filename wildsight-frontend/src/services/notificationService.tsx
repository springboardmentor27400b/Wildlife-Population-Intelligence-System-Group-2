import { api } from "./api";
import { Notification } from "../types/notification";

export const getAllNotifications = async (): Promise<Notification[]> => {

    const { data } = await api.get("/api/notifications");

    return data;

};

export const getNotification = async (
    id:number
):Promise<Notification>=>{

    const {data}=await api.get(`/api/notifications/${id}`);

    return data;

};

export const deleteNotification = async(id:number)=>{

    await api.delete(`/api/notifications/${id}`);

};