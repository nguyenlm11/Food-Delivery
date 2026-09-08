import User from '../models/user.model';

const handleGetAllUsers = async () => {
    return await User
        .find()
        .populate("roleId", "name")
        .select("-password")
        .lean()
}

export { handleGetAllUsers }