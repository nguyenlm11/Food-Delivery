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
        isActive: true
    },
    {
        ruleType: "PEAK_HOUR",
        name: "Cao điểm trưa",
        baseFee: 0,
        perKmFee: 0,
        multiplier: 1.2,
        startTime: "11:00",
        endTime: "14:00",
        specialDate: null,
        isActive: true
    },
    {
        ruleType: "PEAK_HOUR",
        name: "Cao điểm tối",
        baseFee: 0,
        perKmFee: 0,
        multiplier: 1.25,
        startTime: "17:00",
        endTime: "21:00",
        specialDate: null,
        isActive: true
    },
    {
        ruleType: "WEEKEND",
        name: "Phụ phí Cuối tuần (T7, CN)",
        baseFee: 0,
        perKmFee: 0,
        multiplier: 1.1,
        startTime: null,
        endTime: null,
        specialDate: null,
        isActive: true
    },
    {
        ruleType: "HOLIDAY",
        name: "Lễ Quốc Khánh 2/9",
        baseFee: 0,
        perKmFee: 0,
        multiplier: 1.3,
        startTime: null,
        endTime: null,
        specialDate: "09-02",
        isActive: true
    },
    {
        ruleType: "WEATHER",
        name: "Phụ phí trời mưa bão",
        baseFee: 0,
        perKmFee: 0,
        multiplier: 1.3,
        startTime: null,
        endTime: null,
        specialDate: null,
        isActive: false
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