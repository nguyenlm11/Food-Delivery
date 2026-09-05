import Role from "../models/role.model";

const roles = [
    {
        name: "ADMIN",
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
                role,
                {
                    upsert: true,
                    new: true,
                }
            );
        }
        console.log("Roles seeded successfully!");
    } catch (error) {
        console.error("Role seeding error:", error);
    }
};

export default seedRoles;