import cron from "node-cron"
import { WalletTransaction } from "../models/wallet.model"

export const startWalletTransactionJob = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const expireTime = new Date(Date.now() - 15 * 60 * 1000)

            const result = await WalletTransaction.updateMany(
                {
                    status: "PENDING",
                    createdAt: { $lt: expireTime }
                },
                { $set: { status: "FAILED" } }
            )

            if (result.modifiedCount > 0) {
                console.log(`[WalletTransactionJob] Expired ${result.modifiedCount} transaction(s)`)
            }
        }
        catch (error) {
            console.error("[WalletTransactionJob] Error:", error)
        }
    })
}