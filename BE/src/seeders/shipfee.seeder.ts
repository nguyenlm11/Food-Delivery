import ShipFee from "../models/shipfee.model"

const shipFees = [
    {
        ruleType: "BASE_FEE",
        name: "Phí cơ bản",
        baseFee: 15000,
        perKmFee: 5000,
        multiplier: 1.0,
        startTime: null,
        endTime: null,
        specialDate: null,
    }
]

const seedShipFees = async () => {
    try {
        for (const fee of shipFees) {
            await ShipFee.findOneAndUpdate(
                { name: fee.name },
                { $setOnInsert: fee },
                { upsert: true, returnDocument: 'after' }
            )
        }
    }
    catch (error) {
        console.error("Ship fee seeding error:", error)
    }
}

export default seedShipFees