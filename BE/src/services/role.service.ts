import Role from "../models/role.model"

const handleGetAllRoles = async () => {
    const roles = await Role
        .find()
        .select("_id name")
        .lean()

    return roles
}

export { handleGetAllRoles }