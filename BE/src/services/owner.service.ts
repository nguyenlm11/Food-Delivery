import Owner from "../models/owner.model"

const handleGetAllOwner = async () => {
    const owner = await Owner
        .find()
        .populate("userId", "-password")
        .lean()

    return owner
}

export { handleGetAllOwner }