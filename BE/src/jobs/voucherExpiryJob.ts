import cron from "node-cron"
import Voucher from "../models/voucher.model"

export const startVoucherExpiryJob = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const datePart = {
                $substrBytes: [{ $toString: "$endDate" }, 0, 10]
            }
            const expiryInstant = {
                $convert: {
                    input: { $concat: [datePart, "T", "$endTime", ":59+07:00"] },
                    to: "date",
                    onError: null,
                    onNull: null
                }
            }

            const result = await Voucher.updateMany(
                {
                    status: "ACTIVE",
                    $expr: {
                        $and: [
                            { $ne: [expiryInstant, null] },
                            { $lt: [expiryInstant, new Date()] }
                        ]
                    }
                },
                { $set: { status: "EXPIRED" } }
            )

            if (result.modifiedCount > 0) {
                console.log(`[VoucherExpiryJob] Expired ${result.modifiedCount} voucher(s)`)
            }
        }
        catch (error) {
            console.error("[VoucherExpiryJob] Error:", error)
        }
    })
}
