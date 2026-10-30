import type { getAllShipFeeParams } from "@/types/shipfee.type";
import api from "./api";

export const getAllShipFee = async (params: getAllShipFeeParams) => {
    const { page, limit, search, status, ruleType } = params
    const response = await api.get("/ship-fees", {
        params: { page, limit, search: search?.trim(), status, ruleType }
    })
    return response.data
}