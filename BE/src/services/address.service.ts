// import mongoose from "mongoose";
// import Address from "../models/address.model";
// import Customer from "../models/customer.model";
// import User from "../models/user.model";
// import { AppError } from "../errors/AppError";
// import Role from "../models/role.model";
// import { AddressCreateParams, AddressUpdateParams, AddressSearchQuery } from "../interfaces/address.interface";

// const validateObjectId = (id: string, code: string) => {
//     if (!mongoose.isValidObjectId(id)) {
//         throw new AppError("Invalid ID format!", 400, code);
//     }
// };

// const validateCustomer = async (userId: string) => {
//     validateObjectId(userId, "CUSTOMER_INVALID_ID");

//     const customerRole = await Role.findOne({
//         name: "CUSTOMER"
//     }).select("_id").lean();

//     if (!customerRole) {
//         throw new AppError("CUSTOMER role not found!", 500, "CUSTOMER_ROLE_NOT_FOUND");
//     }

//     const user = await User.findOne({
//         _id: userId,
//         roleId: customerRole._id,
//         status: "ACTIVE"
//     }).select("_id birthday").lean();

//     if (!user) {
//         throw new AppError("Customer not found!", 404, "CUSTOMER_NOT_FOUND");
//     }

//     const customer = await Customer.findOneAndUpdate(
//         { userId: user._id },
//         { $setOnInsert: { userId: user._id, birthday: user.birthday ?? null, defaultAddressId: null } },
//         { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     const defaultAddress = await Address.findOne({ customerId: user._id, isDefault: true })
//         .sort({ createdAt: -1, _id: -1 })
//         .select("_id")
//         .lean();
//     const defaultAddressId = defaultAddress?._id ?? null;
//     if (customer.defaultAddressId?.toString() !== defaultAddressId?.toString()) {
//         customer.defaultAddressId = defaultAddressId;
//         await customer.save();
//     }

//     return { user, customer };
// };

// const validateCoordinates = (longitude: unknown, latitude: unknown) => {
//     if (
//         typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
//         typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90
//     ) {
//         throw new AppError("Longitude or latitude is invalid!", 400, "ADDRESS_INVALID_COORDINATES");
//     }
// };

// const handleGetMyAddresses = async (userId: string, query: AddressSearchQuery) => {
//     const { user } = await validateCustomer(userId);

//     const requestedPage = query.page === undefined ? 1 : Number(query.page);
//     const requestedLimit = query.limit === undefined ? 10 : Number(query.limit);
//     if (!Number.isInteger(requestedPage) || requestedPage < 1) {
//         throw new AppError("Page must be a positive integer!", 400, "ADDRESS_INVALID_PAGE");
//     }
//     if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
//         throw new AppError("Limit must be a positive integer!", 400, "ADDRESS_INVALID_LIMIT");
//     }

//     const page = requestedPage;
//     const limit = Math.min(100, requestedLimit);
//     const skip = (page - 1) * limit;

//     const filter = { customerId: user._id };

//     const [addresses, total] = await Promise.all([
//         Address.find(filter)
//             .sort({ isDefault: -1, createdAt: -1, _id: -1 })
//             .skip(skip)
//             .limit(limit)
//             .lean(),

//         Address.countDocuments(filter)
//     ]);

//     return {
//         addresses,
//         pagination: {
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit)
//         }
//     };
// };

// const handleCreateMyAddress = async (userId: string, params: AddressCreateParams) => {
//     const { user, customer } = await validateCustomer(userId);

//     if (!params) {
//         throw new AppError("Missing required fields!", 400, "ADDRESS_REQUIRED_FIELDS");
//     }

//     const requiredFields = ["label", "recipientName", "recipientPhone", "addressLine"] as const;

//     for (const field of requiredFields) {
//         if (
//             typeof params[field] !== "string" || !params[field].trim()
//         ) {
//             throw new AppError(`Missing or invalid field: ${field}`, 400, "ADDRESS_REQUIRED_FIELDS");
//         }
//     }

//     validateCoordinates(params.longitude, params.latitude);

//     if (params.isDefault !== undefined && typeof params.isDefault !== "boolean") {
//         throw new AppError("isDefault must be a boolean!", 400, "ADDRESS_INVALID_DEFAULT_FLAG");
//     }

//     const session = await mongoose.startSession();
//     try {
//         const createdAddress: { value?: any } = {};
//         await session.withTransaction(async () => {
//             const hasDefaultAddress = await Address.exists({
//                 customerId: user._id,
//                 isDefault: true
//             }).session(session);
//             const shouldBeDefault = params.isDefault === true || !hasDefaultAddress;

//             const [address] = await Address.create([{
//                 customerId: user._id,
//                 label: params.label.trim(),
//                 recipientName: params.recipientName.trim(),
//                 recipientPhone: params.recipientPhone.trim(),
//                 addressLine: params.addressLine.trim(),
//                 longitude: params.longitude,
//                 latitude: params.latitude,
//                 isDefault: shouldBeDefault,
//             }], { session });

//             if (shouldBeDefault) {
//                 await Address.updateMany(
//                     { customerId: user._id, _id: { $ne: address._id } },
//                     { $set: { isDefault: false } },
//                     { session }
//                 );
//                 customer.defaultAddressId = address._id;
//                 await customer.save({ session });
//             }

//             createdAddress.value = address;
//         });

//         if (!createdAddress.value) {
//             throw new AppError("Address could not be created!", 500, "ADDRESS_CREATION_FAILED");
//         }
//         return createdAddress.value.toObject();
//     } finally {
//         await session.endSession();
//     }
// };

// const handleUpdateMyAddress = async (userId: string, addressId: string, params: AddressUpdateParams) => {
//     validateObjectId(addressId, "ADDRESS_INVALID_ID");

//     if (!params || Object.keys(params).length === 0) {
//         throw new AppError("Missing update fields!", 400, "ADDRESS_REQUIRED_FIELDS");
//     }

//     const allowedUpdateFields = new Set(["label", "recipientName", "recipientPhone", "addressLine", "longitude", "latitude"]);
//     if (Object.keys(params).some(field => !allowedUpdateFields.has(field))) {
//         throw new AppError("One or more update fields are not supported!", 400, "ADDRESS_INVALID_FIELD");
//     }

//     const { user } = await validateCustomer(userId);

//     const address = await Address.findOne({
//         _id: addressId,
//         customerId: user._id
//     });

//     if (!address) {
//         throw new AppError("Address not found!", 404, "ADDRESS_NOT_FOUND");
//     }

//     const allowedFields = ["label", "recipientName", "recipientPhone", "addressLine"] as const;

//     for (const field of allowedFields) {
//         const value = params[field];

//         if (value !== undefined) {
//             if (typeof value !== "string" || !value.trim()) {
//                 throw new AppError(`Invalid field: ${field}`, 400, "ADDRESS_INVALID_FIELD");
//             }

//             address.set(field, value.trim());
//         }
//     }

//     if (params.longitude !== undefined || params.latitude !== undefined) {
//         const longitude = params.longitude !== undefined ? params.longitude : address.longitude;
//         const latitude = params.latitude !== undefined ? params.latitude : address.latitude;
//         validateCoordinates(longitude, latitude);
//         address.longitude = longitude;
//         address.latitude = latitude;
//     }

//     await address.save();

//     return address.toObject();
// };

// const handleSetDefaultAddress = async (userId: string, addressId: string) => {
//     validateObjectId(addressId, "ADDRESS_INVALID_ID");

//     const { user, customer } = await validateCustomer(userId);
//     const session = await mongoose.startSession();
//     try {
//         let selectedAddress: InstanceType<typeof Address> | null = null;
//         await session.withTransaction(async () => {
//             const address = await Address.findOne({ _id: addressId, customerId: user._id }).session(session);
//             if (!address) {
//                 throw new AppError("Address not found!", 404, "ADDRESS_NOT_FOUND");
//             }

//             await Address.updateMany(
//                 { customerId: user._id, _id: { $ne: address._id } },
//                 { $set: { isDefault: false } },
//                 { session }
//             );
//             address.isDefault = true;
//             await address.save({ session });
//             customer.defaultAddressId = address._id;
//             await customer.save({ session });
//             selectedAddress = address;
//         });
//         return selectedAddress!.toObject();
//     } finally {
//         await session.endSession();
//     }
// };

// const handleDeleteMyAddress = async (userId: string, addressId: string) => {
//     validateObjectId(addressId, "ADDRESS_INVALID_ID");

//     const { user, customer } = await validateCustomer(userId);
//     const session = await mongoose.startSession();
//     try {
//         let result: { deletedAddressId: mongoose.Types.ObjectId; defaultAddressId: mongoose.Types.ObjectId | null } | null = null;
//         await session.withTransaction(async () => {
//             const address = await Address.findOne({ _id: addressId, customerId: user._id }).session(session);
//             if (!address) {
//                 throw new AppError("Address not found!", 404, "ADDRESS_NOT_FOUND");
//             }

//             const wasDefault = address.isDefault || customer.defaultAddressId?.toString() === address._id.toString();
//             await address.deleteOne({ session });

//             let newDefaultAddress: InstanceType<typeof Address> | null = null;
//             if (wasDefault) {
//                 newDefaultAddress = await Address.findOne({ customerId: user._id })
//                     .sort({ createdAt: -1, _id: -1 })
//                     .session(session);
//                 if (newDefaultAddress) {
//                     await Address.updateMany(
//                         { customerId: user._id, _id: { $ne: newDefaultAddress._id } },
//                         { $set: { isDefault: false } },
//                         { session }
//                     );
//                     newDefaultAddress.isDefault = true;
//                     await newDefaultAddress.save({ session });
//                 } else {
//                     await Address.updateMany(
//                         { customerId: user._id },
//                         { $set: { isDefault: false } },
//                         { session }
//                     );
//                 }
//                 customer.defaultAddressId = newDefaultAddress?._id ?? null;
//                 await customer.save({ session });
//             }

//             result = {
//                 deletedAddressId: address._id,
//                 defaultAddressId: newDefaultAddress?._id ?? null
//             };
//         });
//         return result!;
//     } finally {
//         await session.endSession();
//     }
// };

// export { handleGetMyAddresses, handleCreateMyAddress, handleUpdateMyAddress, handleSetDefaultAddress, handleDeleteMyAddress };
