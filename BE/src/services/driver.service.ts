import Driver from "../models/driver.model"
import User from "../models/user.model"

const handleGetAllDrivers = async () => {
    const drivers = await Driver
        .find()
        .populate("userId", "-password -__v")
        .lean()

    return drivers
}

export { handleGetAllDrivers }