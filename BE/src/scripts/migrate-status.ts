import mongoose from "mongoose"
import dotenv from "dotenv"
import dns from "dns"

dotenv.config()
dns.setServers(["8.8.8.8", "8.8.4.4"])

const run = async () => {
    await mongoose.connect(process.env.MONGO_URL as string)
    const db = mongoose.connection

    const booleanToStatus = [
        { collection: "categories", field: "isActive", deletedValue: "DELETED" },
        { collection: "menus", field: "isActive", deletedValue: "DELETED" },
        { collection: "modifiergroups", field: "isActive", deletedValue: "DELETED" },
        { collection: "modifieroptions", field: "isAvailable", deletedValue: "INACTIVE" },
        { collection: "foods", field: "isAvailable", deletedValue: "INACTIVE" }
    ]

    for (const item of booleanToStatus) {
        const col = db.collection(item.collection)

        const total = await col.countDocuments({})
        const active = await col.countDocuments({ [item.field]: true })
        const inactive = await col.countDocuments({ [item.field]: false })
        const missing = await col.countDocuments({ [item.field]: { $exists: false } })

        if (total > 0) {
            const backup = db.collection(`${item.collection}_backup_status`)
            const existed = await backup.countDocuments({})
            if (existed === 0) {
                await col.find({}).toArray().then(docs => backup.insertMany(docs))
                console.log(`[backup] ${item.collection} -> ${item.collection}_backup_status (${total} docs)`)
            }
            else {
                console.log(`[backup] ${item.collection}_backup_status đã tồn tại (${existed} docs), giữ nguyên`)
            }
        }

        const result = await col.updateMany(
            { [item.field]: { $exists: true } },
            [
                {
                    $set: {
                        status: {
                            $cond: [
                                { $eq: [`$${item.field}`, true] },
                                "ACTIVE",
                                item.deletedValue
                            ]
                        }
                    }
                },
                { $unset: item.field }
            ]
        )

        const after = await col.countDocuments({ status: { $exists: true } })

        console.log(
            `${item.collection}: total=${total} ${item.field}=true:${active} =false:${inactive} missing:${missing} -> modified=${result.modifiedCount} statusExists=${after}`
        )
    }

    console.log("\n=== KIỂM TRA SAU MIGRATE ===")
    for (const item of booleanToStatus) {
        const col = db.collection(item.collection)
        const rows = await col.find({}, { projection: { status: 1, name: 1 } }).limit(5).toArray()
        console.log(`${item.collection}: ${rows.map(r => r.status).join(", ")}`)
    }

    await mongoose.disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })
