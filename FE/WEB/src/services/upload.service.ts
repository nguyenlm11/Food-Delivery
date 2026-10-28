import axios from "axios"
import api from "./api"

export const uploadImage = async (file: File) => {
    const response = await api.get("/signature")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("api_key", response.data.apiKey)
    formData.append("timestamp", String(response.data.timestamp))
    formData.append("signature", response.data.signature)
    formData.append("folder", response.data.folder)

    const data = await axios.post(`https://api.cloudinary.com/v1_1/${response.data.cloudName}/image/upload`, formData)

    return data.data.secure_url
}