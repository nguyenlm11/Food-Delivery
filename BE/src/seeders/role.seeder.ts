import Role from "../models/role.model";

const roles = [
    {
        name: "ADMIN",
    },
    {
        name: "OWNER",
    },
    {
        name: "RESTAURANT",
    },
    {
        name: "DRIVER",
    },
    {
        name: "CUSTOMER",
    },
];

const seedRoles = async () => {
    try {
        for (const role of roles) {
            await Role.findOneAndUpdate(
                { name: role.name },
                { $setOnInsert: role },
                { upsert: true, returnDocument: 'after' }
            );
        }
    }
    catch (error) {
        console.error("Role seeding error:", error)
    }
};

export default seedRoles