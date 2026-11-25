# BE Models Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse 28 BE model files into 16, one per domain, with dependent schemas merged into their parent's file and a single named-export style across the folder.

**Architecture:** Each domain's file holds every model that exists only to serve that domain, registered with mongoose in dependency order (parent first). Every model file exports by name — `export default` is removed folder-wide — so every file has the same shape and the file's contents are discoverable from its import line. No schema, field, index, model name, or collection name changes.

**Tech Stack:** TypeScript 7, Mongoose 9, Express 5, Node's built-in `node:test` runner.

**Spec:** `docs/superpowers/specs/2026-11-25-be-models-consolidation-design.md`

## Global Constraints

- `mongoose.model("X", schema)` — the first argument string is the collection name source. It must be copied **verbatim** into the new file. Never rename a registered model.
- Every `schema.index(...)` line moves to the new file **verbatim**, attached to the same schema.
- Every `ref: "..."` value stays a string. **Do not add `import` statements between model files** — mongoose resolves string refs lazily at populate time, and cross-imports risk circular imports for no benefit.
- Model registration order inside a merged file follows dependency order (parent first): `Cart, CartItem, CartItemOption`; `ModifierGroup, ModifierOption, FoodModifierGroup`; `Driver, DriverLocation, DriverEarning`; `User, OTP, RefreshToken`; `Restaurant, RestaurantCategory, RestaurantSettlement`; `Voucher, VoucherUsage`; `Wallet, WalletTransaction`.
- Export style across all 16 model files: **named exports only**. `export default` is removed everywhere, including files that hold a single model.
- No new dependencies. No changes to services/controllers/routes logic beyond import lines.
- Typecheck gate: `npm run typecheck` in `BE` must exit 0 at the end of every task.

## File Structure

**Files created (16 total, replacing the current 28):**

| New file | Models | Replaces |
|---|---|---|
| `BE/src/models/user.model.ts` | User, OTP, RefreshToken | `user.model.ts`, `otp.model.ts`, `refresh_token.model.ts` |
| `BE/src/models/role.model.ts` | Role | `role.model.ts` (content unchanged, export style only) |
| `BE/src/models/owner.model.ts` | Owner | `owner.model.ts` (export style only) |
| `BE/src/models/restaurant.model.ts` | Restaurant, RestaurantCategory, RestaurantSettlement | `restaurant.model.ts`, `restaurant_category.model.ts`, `restaurant-settlement.model.ts` |
| `BE/src/models/menu.model.ts` | Menu | `menu.model.ts` (export style only) |
| `BE/src/models/food.model.ts` | Food | `food.model.ts` (export style only) |
| `BE/src/models/modifier.model.ts` | ModifierGroup, ModifierOption, FoodModifierGroup | `modifier_group.model.ts`, `modifier_option.model.ts`, `food_modifier_group.model.ts` |
| `BE/src/models/category.model.ts` | Category | `category.model.ts` (export style only) |
| `BE/src/models/shipfee.model.ts` | ShipFee | `shipfee.model.ts` (export style only) |
| `BE/src/models/voucher.model.ts` | Voucher, VoucherUsage | `voucher.model.ts`, `voucher_usage.model.ts` |
| `BE/src/models/cart.model.ts` | Cart, CartItem, CartItemOption | `cart.model.ts`, `cart_item.model.ts`, `cart_item_option.model.ts` |
| `BE/src/models/order.model.ts` | Order | `order.model.ts` (export style only) |
| `BE/src/models/driver.model.ts` | Driver, DriverLocation, DriverEarning | `driver.model.ts`, `driver_location.model.ts`, `driver-earning.model.ts` |
| `BE/src/models/address.model.ts` | Address | `address.model.ts` (export style only) |
| `BE/src/models/notification.model.ts` | Notification | `notification.model.ts` (export style only) |
| `BE/src/models/wallet.model.ts` | Wallet, WalletTransaction | `wallet.model.ts`, `wallet_transaction.model.ts` |

**File created (verification):** `BE/scripts/model-manifest.ts` — imports every model file, asserts the registered model names and collection names match a hard-coded expected map of 28 entries, exits non-zero on any mismatch.

**Files deleted (13):** `cart_item.model.ts`, `cart_item_option.model.ts`, `modifier_group.model.ts`, `modifier_option.model.ts`, `food_modifier_group.model.ts`, `driver_location.model.ts`, `driver-earning.model.ts`, `restaurant_category.model.ts`, `restaurant-settlement.model.ts`, `voucher_usage.model.ts`, `wallet_transaction.model.ts`, `otp.model.ts`, `refresh_token.model.ts`.

**Files modified (import sites only, 26):** 25 source files (18 services + 2 jobs + 1 socket + 1 middleware + 1 config + 3 seeders) + `scripts/order.service.test.ts`. See each task's Interfaces block.

**Files NOT touched:** `BE/src/interfaces/**`, `BE/src/controllers/**`, `BE/src/routes/**`, `BE/src/errors/**`, `BE/src/utils/**`, `FE/**`.
---

## Review Focus

- **A model file imported twice** — two import statements pulling from the same model file, where a single combined named import would do. The manifest script must still see 28 models, not fewer: importing the same file twice is harmless to mongoose but must not hide a missed model.
- **A merged-away file still on disk** — e.g. `cart_item.model.ts` deleted but `cart.service.ts` still importing it. Typecheck catches it; the grep in Task 10 catches leftovers with no importer.
- **A `ref` string silently changed** — e.g. `ref: "CartItem"` becoming `ref: "cart_item"`. `populate("foodId")` in `cart.service.ts` resolves by registered model name; a renamed ref breaks it at runtime, not at compile time. The manifest script checks names, and the order test exercises populate.
- **A collection name change** — `mongoose.model("CartItem", ...)` renamed to `mongoose.model("Cartitem", ...)` silently points at a new empty `cartitems` collection. The manifest script's expected map catches this exactly.
- **An index dropped during the move** — copying a schema but forgetting its `.index()` call. `cartItemSchema.index({ cartId: 1, foodId: 1, optionsKey: 1 }, { unique: true })` is the one that matters most: dropping it allows duplicate cart rows for the same food+options.

---

## Task 1: Model manifest regression script

**Files:**
- Create: `BE/scripts/model-manifest.ts`
- Delete: `BE/scripts/tmp-modelnames.ts` (scratch file created during exploration)

**Interfaces:**
- Consumes: nothing. This task creates the guard every later task is checked against.
- Produces: a runnable command `node --import tsx scripts/model-manifest.ts` that exits 0 only when the registered model names and collection names match the expected map, and exits 1 printing the diff otherwise.

The expected map (28 entries, captured from the current codebase before any change):

```
Address              -> addresses
Cart                 -> carts
CartItem             -> cartitems
CartItemOption       -> cartitemoptions
Category             -> categories
Driver               -> drivers
DriverEarning        -> driverearnings
DriverLocation       -> driverlocations
Food                 -> foods
FoodModifierGroup    -> foodmodifiergroups
Menu                 -> menus
ModifierGroup        -> modifiergroups
ModifierOption       -> modifieroptions
Notification         -> notifications
OTP                  -> otps
Order                -> orders
Owner                -> owners
RefreshToken         -> refreshtokens
Restaurant           -> restaurants
RestaurantCategory   -> restaurantcategories
RestaurantSettlement -> restaurantsettlements
Role                 -> roles
ShipFee              -> shipfees
User                 -> users
Voucher              -> vouchers
VoucherUsage         -> voucherusages
Wallet               -> wallets
WalletTransaction    -> wallettransactions
```

- [ ] **Step 1: Write the manifest script**

Create `BE/scripts/model-manifest.ts`. It must:
- import all 16 model files (paths as they exist at the end of the plan — for now import the current 28 file paths; Task 10 updates it to the 16 final paths),
- build a map of `mongoose.modelNames()` → `mongoose.model(name).collection.name`,
- compare against a hard-coded `EXPECTED: Record<string, string>` object containing the 28 entries above,
- print every mismatch (missing model, extra model, wrong collection) and `process.exit(1)` if any exist,
- print `OK: 28 models, 28 collections` and exit 0 when they match.

Note: the script must use an `async function main()` wrapper, not top-level `await` — the package is `"type": "commonjs"` and tsx compiles to CJS, where top-level await is a transform error.

- [ ] **Step 2: Run the manifest script to verify it passes against the current codebase**

Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit code 0.

- [ ] **Step 3: Verify the script actually fails on a mismatch**

Temporarily edit `BE/src/models/cart.model.ts` to change `mongoose.model("Cart", cartSchema)` to `mongoose.model("CartX", cartSchema)`, run the script, and confirm it exits 1 with a diff line mentioning `CartX`. Then revert that edit exactly.

- [ ] **Step 4: Delete the scratch script**

Delete `BE/scripts/tmp-modelnames.ts`.

- [ ] **Step 5: Commit**

```bash
git add BE/scripts/model-manifest.ts BE/scripts/tmp-modelnames.ts
git commit -m "test(be): add model manifest regression script"
```

---

## Task 2: Merge the cart domain

**Files:**
- Create: `BE/src/models/cart.model.ts` (replacing `cart.model.ts`, `cart_item.model.ts`, `cart_item_option.model.ts`)
- Delete: `BE/src/models/cart_item.model.ts`, `BE/src/models/cart_item_option.model.ts`
- Modify: `BE/src/services/cart.service.ts`, `BE/src/services/order.service.ts`, `BE/scripts/order.service.test.ts`

**Interfaces:**
- Consumes: `CreateCartBody` from `../interfaces/cart.interface` (unchanged).
- Produces: named exports `Cart`, `CartItem`, `CartItemOption` from `../models/cart.model`. Later tasks import `VoucherUsage`, `RestaurantSettlement`, `DriverEarning`, `Wallet`, `WalletTransaction` from their own merged files — unaffected by this task.

Schema blocks to move, in registration order:

1. `cartSchema` from `cart.model.ts` — fields `userId` (ref "User", required), `restaurantId` (ref "Restaurant", required), `totalItemCount` (Number, default 0), `totalPrice` (Number, default 0); `timestamps: true`; index `{ userId: 1, restaurantId: 1 }` unique. Registered as `mongoose.model("Cart", cartSchema)`.
2. `cartItemSchema` from `cart_item.model.ts` — fields `cartId` (ref "Cart", required), `foodId` (ref "Food", required), `quantity` (Number, required, min 1), `price` (Number, required, min 0), `optionsKey` (String, default ""); `timestamps: true`; index `{ cartId: 1, foodId: 1, optionsKey: 1 }` unique. Registered as `mongoose.model("CartItem", cartItemSchema)`.
3. `cartItemOptionSchema` from `cart_item_option.model.ts` — fields `cartItemId` (ref "CartItem", required), `modifierOptionId` (ref "ModifierOption", required), `groupName` (String, required), `optionName` (String, required), `priceAdjustment` (Number, required); `timestamps: true`; index `{ cartItemId: 1, modifierOptionId: 1 }` unique. Registered as `mongoose.model("CartItemOption", cartItemOptionSchema)`.

- [ ] **Step 1: Create the merged `cart.model.ts`**

Write `BE/src/models/cart.model.ts` containing the three schema blocks above in that order, one `import mongoose from "mongoose"` at the top, and a single export statement at the bottom:

```typescript
export { Cart, CartItem, CartItemOption }
```

Do not add any import of `food.model` or `modifier_option.model` — the refs stay strings.

- [ ] **Step 2: Delete the two merged-away files**

Delete `BE/src/models/cart_item.model.ts` and `BE/src/models/cart_item_option.model.ts`.

- [ ] **Step 3: Update `BE/src/services/cart.service.ts` imports**

Replace:
```typescript
import Cart from "../models/cart.model"
import CartItem from "../models/cart_item.model"
import CartItemOption from "../models/cart_item_option.model"
```
with:
```typescript
import { Cart, CartItem, CartItemOption } from "../models/cart.model"
```

- [ ] **Step 4: Update `BE/src/services/order.service.ts` imports**

Replace:
```typescript
import Cart from "../models/cart.model"
import CartItem from "../models/cart_item.model"
import CartItemOption from "../models/cart_item_option.model"
```
with:
```typescript
import { Cart, CartItem, CartItemOption } from "../models/cart.model"
```

- [ ] **Step 5: Update `BE/scripts/order.service.test.ts` imports**

Replace:
```typescript
import Cart from "../src/models/cart.model"
import CartItem from "../src/models/cart_item.model"
```
with:
```typescript
import { Cart, CartItem } from "../src/models/cart.model"
```

- [ ] **Step 6: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 7: Run the manifest script**

Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: still `OK: 28 models, 28 collections` — but the manifest script's import list still points at the deleted files, so first update its import list to drop `../src/models/cart_item.model` and `../src/models/cart_item_option.model` and keep `../src/models/cart.model`. Then run it and confirm exit 0.

- [ ] **Step 8: Commit**

```bash
git add BE/src/models/cart.model.ts BE/src/models/cart_item.model.ts BE/src/models/cart_item_option.model.ts BE/src/services/cart.service.ts BE/src/services/order.service.ts BE/scripts/order.service.test.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge cart domain models into cart.model.ts"
```

---

## Task 3: Merge the modifier domain

**Files:**
- Create: `BE/src/models/modifier.model.ts` (replacing `modifier_group.model.ts`, `modifier_option.model.ts`, `food_modifier_group.model.ts`)
- Delete: `BE/src/models/modifier_group.model.ts`, `BE/src/models/modifier_option.model.ts`, `BE/src/models/food_modifier_group.model.ts`
- Modify: `BE/src/services/modifier.service.ts`, `BE/src/services/cart.service.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: named exports `ModifierGroup`, `ModifierOption`, `FoodModifierGroup` from `../models/modifier.model`.

Schema blocks to move, in registration order:

1. `modifierGroupSchema` from `modifier_group.model.ts` — fields `restaurantId` (ref "Restaurant", required), `name` (String, required, trim), `minSelect` (Number, required, min 0), `maxSelect` (Number, required, min 1), `status` (String, enum `["ACTIVE","INACTIVE","DELETED"]`, default "ACTIVE"); `timestamps: true`; index `{ restaurantId: 1, name: 1 }` unique. Registered as `mongoose.model("ModifierGroup", modifierGroupSchema)`.
2. `modifierOptionSchema` from `modifier_option.model.ts` — fields `modifierGroupId` (ref "ModifierGroup", required), `name` (String, required, trim), `priceAdjustment` (Number, default 0), `status` (String, enum `["ACTIVE","INACTIVE","DELETED"]`, default "ACTIVE"), `sortOrder` (Number, default 0, min 0); `timestamps: true`; index `{ modifierGroupId: 1, name: 1 }` unique. Registered as `mongoose.model("ModifierOption", modifierOptionSchema)`.
3. `foodModifierGroupSchema` from `food_modifier_group.model.ts` — fields `foodId` (ref "Food", required), `modifierGroupId` (ref "ModifierGroup", required); `timestamps: true`; index `{ foodId: 1, modifierGroupId: 1 }` unique. Registered as `mongoose.model("FoodModifierGroup", foodModifierGroupSchema)`.

- [ ] **Step 1: Create the merged `modifier.model.ts`**

Write `BE/src/models/modifier.model.ts` with the three schema blocks above in that order, one `import mongoose from "mongoose"`, and at the bottom:

```typescript
export { ModifierGroup, ModifierOption, FoodModifierGroup }
```

- [ ] **Step 2: Delete the three merged-away files**

Delete `modifier_group.model.ts`, `modifier_option.model.ts`, `food_modifier_group.model.ts`.

- [ ] **Step 3: Update `BE/src/services/modifier.service.ts` imports**

Replace:
```typescript
import ModifierGroup from "../models/modifier_group.model"
import ModifierOption from "../models/modifier_option.model"
import FoodModifierGroup from "../models/food_modifier_group.model"
```
with:
```typescript
import { FoodModifierGroup, ModifierGroup, ModifierOption } from "../models/modifier.model"
```

- [ ] **Step 4: Update `BE/src/services/cart.service.ts` imports**

Replace:
```typescript
import FoodModifierGroup from "../models/food_modifier_group.model"
import ModifierGroup from "../models/modifier_group.model"
import ModifierOption from "../models/modifier_option.model"
```
with:
```typescript
import { FoodModifierGroup, ModifierGroup, ModifierOption } from "../models/modifier.model"
```

- [ ] **Step 5: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 6: Update the manifest import list and run it**

In `BE/scripts/model-manifest.ts`, replace the three modifier imports with `../src/models/modifier.model`.
Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit 0.

- [ ] **Step 7: Commit**

```bash
git add BE/src/models BE/src/services/modifier.service.ts BE/src/services/cart.service.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge modifier domain models into modifier.model.ts"
```

---

## Task 4: Merge the driver domain

**Files:**
- Create: `BE/src/models/driver.model.ts` (replacing `driver.model.ts`, `driver_location.model.ts`, `driver-earning.model.ts`)
- Delete: `BE/src/models/driver_location.model.ts`, `BE/src/models/driver-earning.model.ts`
- Modify: `BE/src/services/driver.service.ts`, `BE/src/sockets/driver.socket.ts`, `BE/src/services/order.service.ts`, `BE/scripts/order.service.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: named exports `Driver`, `DriverLocation`, `DriverEarning` from `../models/driver.model`.

Schema blocks to move, in registration order:

1. `driverSchema` from `driver.model.ts` — fields `userId` (ref "User", required, unique), `citizenId` (String, required, unique, trim), `citizenImages` (nested `{ front: String default "", back: String default "" }`), `driverLicenseId` (String, required, unique, trim), `vehicleModel` (String, required, trim), `vehicleRegistrationId` (String, required, unique, trim), `licensePlate` (String, required, unique, trim), `bankAccount` (nested `{ bankName: String required, accountNumber: String required, accountHolder: String required }`), `status` (String, enum `["OFFLINE","ONLINE","BUSY","SUSPENDED"]`, default "OFFLINE"), `commissionRate` (Number, required, min 0, max 100, default 30), `rating` (Number, default 0, min 0, max 5), `totalDeliveries` (Number, default 0, min 0); `timestamps: true`. Registered as `mongoose.model("Driver", driverSchema)`.
2. `driverLocationSchema` from `driver_location.model.ts` — fields `driverId` (ref "Driver", required, unique), `latitude` (Number, required, min -90, max 90), `longitude` (Number, required, min -180, max 180), `accuracy` (Number, default null), `updatedAt` (Date, default Date.now); `timestamps: true`. Registered as `mongoose.model("DriverLocation", driverLocationSchema)`.
3. `driverEarningSchema` from `driver-earning.model.ts` — fields `orderId` (ref "Order", required, unique), `driverId` (ref "Driver", required), `deliveryFee` (Number, required, min 0), `commissionRate` (Number, required, min 0, max 100), `baseEarning` (Number, required, min 0), `bonusAmount` (Number, default 0, min 0), `tipAmount` (Number, default 0, min 0), `totalEarning` (Number, required, min 0), `platformAmount` (Number, required, min 0), `earningStatus` (String, enum `["PENDING","COMPLETED","CANCELLED","REFUNDED"]`, default "PENDING"); `timestamps: true`. Registered as `mongoose.model("DriverEarning", driverEarningSchema)`.

- [ ] **Step 1: Create the merged `driver.model.ts`**

Write `BE/src/models/driver.model.ts` with the three schema blocks above in that order, one `import mongoose from "mongoose"`, and at the bottom:

```typescript
export { Driver, DriverLocation, DriverEarning }
```

- [ ] **Step 2: Delete the two merged-away files**

Delete `driver_location.model.ts`, `driver-earning.model.ts`.

- [ ] **Step 3: Update `BE/src/services/driver.service.ts` imports**

Replace:
```typescript
import Driver from "../models/driver.model"
import DriverLocation from "../models/driver_location.model"
```
with:
```typescript
import { Driver, DriverLocation } from "../models/driver.model"
```

- [ ] **Step 4: Update `BE/src/sockets/driver.socket.ts` imports**

Replace:
```typescript
import Driver from "../models/driver.model"
import DriverLocation from "../models/driver_location.model"
```
with:
```typescript
import { Driver, DriverLocation } from "../models/driver.model"
```

- [ ] **Step 5: Update `BE/src/services/order.service.ts` imports**

Replace:
```typescript
import Driver from "../models/driver.model"
import DriverEarning from "../models/driver-earning.model"
```
with:
```typescript
import { Driver, DriverEarning } from "../models/driver.model"
```

- [ ] **Step 6: Update `BE/scripts/order.service.test.ts` imports**

Replace:
```typescript
import Driver from "../src/models/driver.model"
import DriverEarning from "../src/models/driver-earning.model"
```
with:
```typescript
import { Driver, DriverEarning } from "../src/models/driver.model"
```

- [ ] **Step 7: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 8: Update the manifest import list and run it**

In `BE/scripts/model-manifest.ts`, replace the driver imports with `../src/models/driver.model`.
Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit 0.

- [ ] **Step 9: Commit**

```bash
git add BE/src/models BE/src/services/driver.service.ts BE/src/services/order.service.ts BE/src/sockets/driver.socket.ts BE/scripts/order.service.test.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge driver domain models into driver.model.ts"
```

---

## Task 5: Merge the wallet domain

**Files:**
- Create: `BE/src/models/wallet.model.ts` (replacing `wallet.model.ts`, `wallet_transaction.model.ts`)
- Delete: `BE/src/models/wallet_transaction.model.ts`
- Modify: `BE/src/services/wallet.service.ts`, `BE/src/jobs/walletTransactionJob.ts`, `BE/src/services/order.service.ts`, `BE/scripts/order.service.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: named exports `Wallet`, `WalletTransaction` from `../models/wallet.model`.

Schema blocks to move, in registration order:

1. `walletSchema` from `wallet.model.ts` — fields `userId` (ref "User", required, unique), `balance` (Number, default 0, min 0); `timestamps: true`. Registered as `mongoose.model("Wallet", walletSchema)`.
2. `walletTransactionSchema` from `wallet_transaction.model.ts` — fields `walletId` (ref "Wallet", required), `type` (String, enum `["TOPUP","PAYMENT","REFUND"]`, required), `amount` (Number, required, min 0), `balanceBefore` (Number, min 0, default null), `balanceAfter` (Number, min 0, default null), `status` (String, enum `["PENDING","SUCCESS","FAILED"]`, default "PENDING", required), `transactionRef` (String, required, unique), `vnpTransactionNo` (String, default null), `description` (String, trim, default ""); `timestamps: true`. Registered as `mongoose.model("WalletTransaction", walletTransactionSchema)`.

- [ ] **Step 1: Create the merged `wallet.model.ts`**

Write `BE/src/models/wallet.model.ts` with the two schema blocks above in that order, one `import mongoose from "mongoose"`, and at the bottom:

```typescript
export { Wallet, WalletTransaction }
```

- [ ] **Step 2: Delete the merged-away file**

Delete `wallet_transaction.model.ts`.

- [ ] **Step 3: Update `BE/src/services/wallet.service.ts` imports**

Replace:
```typescript
import Wallet from "../models/wallet.model"
import WalletTransaction from "../models/wallet_transaction.model"
```
with:
```typescript
import { Wallet, WalletTransaction } from "../models/wallet.model"
```

- [ ] **Step 4: Update `BE/src/jobs/walletTransactionJob.ts` imports**

Replace:
```typescript
import WalletTransaction from "../models/wallet_transaction.model"
```
with:
```typescript
import { WalletTransaction } from "../models/wallet.model"
```

- [ ] **Step 5: Update `BE/src/services/order.service.ts` imports**

Replace:
```typescript
import Wallet from "../models/wallet.model"
import WalletTransaction from "../models/wallet_transaction.model"
```
with:
```typescript
import { Wallet, WalletTransaction } from "../models/wallet.model"
```

- [ ] **Step 6: Update `BE/scripts/order.service.test.ts` imports**

Replace:
```typescript
import Wallet from "../src/models/wallet.model"
import WalletTransaction from "../src/models/wallet_transaction.model"
```
with:
```typescript
import { Wallet, WalletTransaction } from "../src/models/wallet.model"
```

- [ ] **Step 7: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 8: Update the manifest import list and run it**

In `BE/scripts/model-manifest.ts`, replace the wallet imports with `../src/models/wallet.model`.
Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit 0.

- [ ] **Step 9: Commit**

```bash
git add BE/src/models BE/src/services/wallet.service.ts BE/src/jobs/walletTransactionJob.ts BE/src/services/order.service.ts BE/scripts/order.service.test.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge wallet domain models into wallet.model.ts"
```

---

## Task 6: Merge the voucher domain

**Files:**
- Create: `BE/src/models/voucher.model.ts` (replacing `voucher.model.ts`, `voucher_usage.model.ts`)
- Delete: `BE/src/models/voucher_usage.model.ts`
- Modify: `BE/src/services/voucher.service.ts`, `BE/src/services/order.service.ts`, `BE/scripts/order.service.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: named exports `Voucher`, `VoucherUsage` from `../models/voucher.model`.

Schema blocks to move, in registration order:

1. `voucherSchema` from `voucher.model.ts` — fields `name` (String, required, trim), `description` (String, trim, default ""), `code` (String, required, trim, uppercase, unique), `typeVoucher` (String, enum `["SYSTEM","RESTAURANT"]`, required), `type` (String, enum `["FOOD","SHIP"]`, required), `typeDiscount` (String, enum `["AMOUNT","PERCENT"]`, required), `discountValue` (Number, required, min 0), `maxDiscount` (Number, min 0, default null), `minPrice` (Number, required, min 0, default 0), `startDate` (String, required), `endDate` (String, required), `startTime` (String, required, default "00:00", match `/^([01]\d|2[0-3]):[0-5]\d$/`), `endTime` (String, required, default "23:59", match same), `maxQuantity` (Number, min 1, default null), `usedQuantity` (Number, default 0, min 0), `status` (String, enum `["ACTIVE","INACTIVE","EXPIRED","DELETED"]`, default "ACTIVE"), `restaurantId` (ref "Restaurant", default null), `createdBy` (ref "User", required); `timestamps: true`. Registered as `mongoose.model("Voucher", voucherSchema)`.
2. `voucherUsageSchema` from `voucher_usage.model.ts` — fields `voucherId` (ref "Voucher", required), `userId` (ref "User", required), `orderId` (ref "Order", required), `discountAmount` (Number, required, min 0), `status` (String, enum `["RESERVED","USED","CANCELLED"]`, default "RESERVED", required), `usedAt` (Date, default null); `timestamps: true`. Registered as `mongoose.model("VoucherUsage", voucherUsageSchema)`.

- [ ] **Step 1: Create the merged `voucher.model.ts`**

Write `BE/src/models/voucher.model.ts` with the two schema blocks above in that order, one `import mongoose from "mongoose"`, and at the bottom:

```typescript
export { Voucher, VoucherUsage }
```

- [ ] **Step 2: Delete the merged-away file**

Delete `voucher_usage.model.ts`.

- [ ] **Step 3: Update `BE/src/services/voucher.service.ts` imports**

Replace:
```typescript
import Voucher from "../models/voucher.model"
```
with:
```typescript
import { Voucher } from "../models/voucher.model"
```

- [ ] **Step 4: Update `BE/src/services/order.service.ts` imports**

Replace:
```typescript
import Voucher from "../models/voucher.model"
import VoucherUsage from "../models/voucher_usage.model"
```
with:
```typescript
import { Voucher, VoucherUsage } from "../models/voucher.model"
```

- [ ] **Step 5: Update `BE/scripts/order.service.test.ts` imports**

Replace:
```typescript
import VoucherUsage from "../src/models/voucher_usage.model"
```
with:
```typescript
import { VoucherUsage } from "../src/models/voucher.model"
```

- [ ] **Step 6: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 7: Update the manifest import list and run it**

In `BE/scripts/model-manifest.ts`, replace the voucher imports with `../src/models/voucher.model`.
Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit 0.

- [ ] **Step 8: Commit**

```bash
git add BE/src/models BE/src/services/voucher.service.ts BE/src/services/order.service.ts BE/scripts/order.service.test.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge voucher domain models into voucher.model.ts"
```

---

## Task 7: Merge the auth domain into user.model.ts

**Files:**
- Create: `BE/src/models/user.model.ts` (replacing `user.model.ts`, `otp.model.ts`, `refresh_token.model.ts`)
- Delete: `BE/src/models/otp.model.ts`, `BE/src/models/refresh_token.model.ts`
- Modify: `BE/src/services/auth.service.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: named exports `User`, `OTP`, `RefreshToken` from `../models/user.model`.

Schema blocks to move, in registration order:

1. `userSchema` from `user.model.ts` — fields `avatar` (String, default null, trim), `fullname` (String, required, trim), `email` (String, required, unique, trim), `birthday` (Date), `address` (String, trim), `phone` (String, trim), `status` (String, required, enum `["ACTIVE","INACTIVE","PENDING","BLOCKED","DELETED"]`, trim, default "PENDING"), `password` (String, required, trim), `roleId` (ref "Role", required); `timestamps: true`; index `{ phone: 1 }` unique with `partialFilterExpression: { phone: { $type: "string" } }`. Registered as `mongoose.model("User", userSchema)`.
2. `otpSchema` from `otp.model.ts` — fields `userId` (ref "User", required), `otp` (String, required), `type` (String, enum `["REGISTER","RESET_PASSWORD","DELETE_ACCOUNT"]`), `expiresAt` (Date, required), `attempts` (Number, default 0); `timestamps: true`; index `{ expiresAt: 1 }` with `expireAfterSeconds: 0`. Registered as `mongoose.model("OTP", otpSchema)`.
3. `refreshTokenSchema` from `refresh_token.model.ts` — fields `userId` (ref "User", required), `tokenHash` (String, required, unique), `expiresAt` (Date, required), `revokedAt` (Date, default null); `timestamps: true`; index `{ expiresAt: 1 }` with `expireAfterSeconds: 0`. Registered as `mongoose.model("RefreshToken", refreshTokenSchema)`.

- [ ] **Step 1: Create the merged `user.model.ts`**

Write `BE/src/models/user.model.ts` with the three schema blocks above in that order, one `import mongoose from "mongoose"`, and at the bottom:

```typescript
export { User, OTP, RefreshToken }
```

- [ ] **Step 2: Delete the two merged-away files**

Delete `otp.model.ts`, `refresh_token.model.ts`.

- [ ] **Step 3: Update `BE/src/services/auth.service.ts` imports**

Replace:
```typescript
import User from "../models/user.model"
import OTP from "../models/otp.model"
import RefreshToken from "../models/refresh_token.model"
```
with:
```typescript
import { OTP, RefreshToken, User } from "../models/user.model"
```

- [ ] **Step 4: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 5: Update the manifest import list and run it**

In `BE/scripts/model-manifest.ts`, replace the user/otp/refresh_token imports with `../src/models/user.model`.
Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add BE/src/models BE/src/services/auth.service.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge otp and refresh token into user.model.ts"
```

---

## Task 8: Merge the restaurant domain

**Files:**
- Create: `BE/src/models/restaurant.model.ts` (replacing `restaurant.model.ts`, `restaurant_category.model.ts`, `restaurant-settlement.model.ts`)
- Delete: `BE/src/models/restaurant_category.model.ts`, `BE/src/models/restaurant-settlement.model.ts`
- Modify: `BE/src/services/restaurant.service.ts`, `BE/src/services/order.service.ts`, `BE/scripts/order.service.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: named exports `Restaurant`, `RestaurantCategory`, `RestaurantSettlement` from `../models/restaurant.model`.

Schema blocks to move, in registration order:

1. `restaurantSchema` from `restaurant.model.ts` — fields `name` (String, required, trim), `description` (String, trim, default ""), `logoImage` (String, trim, default ""), `coverImage` (String, trim, default ""), `phone` (String, required), `address` (String, required), `longitude` (Number, required, min -180, max 180), `latitude` (Number, required, min -90, max 90), `openTime` (String, default "08:00", trim), `closeTime` (String, default "22:00", trim), `rating` (Number, default 0, min 0, max 5), `totalReviews` (Number, default 0, min 0), `status` (String, enum `["ACTIVE","INACTIVE","CLOSED","DELETED"]`, default "INACTIVE", required), `approvalStatus` (String, enum `["PENDING","APPROVED","REJECTED"]`, default "PENDING", required), `rejectionReason` (String, default ""), `commissionRate` (Number, required, min 0, max 100, default 20), `ownerId` (ref "Owner", required), `userId` (ref "User"); `timestamps: true`; index `{ userId: 1 }` unique with `partialFilterExpression: { userId: { $type: "objectId" } }`. Registered as `mongoose.model("Restaurant", restaurantSchema)`.
2. `restaurantCategorySchema` from `restaurant_category.model.ts` — fields `restaurantId` (ref "Restaurant", required), `categoryId` (ref "Category", required); `timestamps: true`; index `{ restaurantId: 1, categoryId: 1 }` unique. Registered as `mongoose.model("RestaurantCategory", restaurantCategorySchema)`.
3. `restaurantSettlementSchema` from `restaurant-settlement.model.ts` — fields `orderId` (ref "Order", required, unique), `restaurantId` (ref "Restaurant", required), `ownerId` (ref "Owner", required), `grossAmount` (Number, required, min 0), `restaurantDiscountAmount` (Number, default 0, min 0), `netSalesAmount` (Number, required, min 0), `commissionRate` (Number, required, min 0, max 100), `commissionAmount` (Number, required, min 0), `restaurantAmount` (Number, required, min 0), `settlementStatus` (String, enum `["PENDING","COMPLETED","CANCELLED","REFUNDED"]`, default "PENDING"); `timestamps: true`. Registered as `mongoose.model("RestaurantSettlement", restaurantSettlementSchema)`.

- [ ] **Step 1: Create the merged `restaurant.model.ts`**

Write `BE/src/models/restaurant.model.ts` with the three schema blocks above in that order, one `import mongoose from "mongoose"`, and at the bottom:

```typescript
export { Restaurant, RestaurantCategory, RestaurantSettlement }
```

- [ ] **Step 2: Delete the two merged-away files**

Delete `restaurant_category.model.ts`, `restaurant-settlement.model.ts`.

- [ ] **Step 3: Update `BE/src/services/restaurant.service.ts` imports**

Replace:
```typescript
import Restaurant from "../models/restaurant.model"
import RestaurantCategory from "../models/restaurant_category.model"
```
with:
```typescript
import { Restaurant, RestaurantCategory } from "../models/restaurant.model"
```

- [ ] **Step 4: Update `BE/src/services/order.service.ts` imports**

Replace:
```typescript
import Restaurant from "../models/restaurant.model"
import RestaurantSettlement from "../models/restaurant-settlement.model"
```
with:
```typescript
import { Restaurant, RestaurantSettlement } from "../models/restaurant.model"
```

- [ ] **Step 5: Update `BE/scripts/order.service.test.ts` imports**

Replace:
```typescript
import Restaurant from "../src/models/restaurant.model"
import RestaurantSettlement from "../src/models/restaurant-settlement.model"
```
with:
```typescript
import { Restaurant, RestaurantSettlement } from "../src/models/restaurant.model"
```

- [ ] **Step 6: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 7: Update the manifest import list and run it**

In `BE/scripts/model-manifest.ts`, replace the restaurant imports with `../src/models/restaurant.model`.
Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit 0.

- [ ] **Step 8: Commit**

```bash
git add BE/src/models BE/src/services/restaurant.service.ts BE/src/services/order.service.ts BE/scripts/order.service.test.ts BE/scripts/model-manifest.ts
git commit -m "refactor(be): merge restaurant domain models into restaurant.model.ts"
```

---

## Task 9: Convert remaining single-model files to named exports

**Files:**
- Modify (content only — export style): `BE/src/models/role.model.ts`, `owner.model.ts`, `menu.model.ts`, `food.model.ts`, `category.model.ts`, `shipfee.model.ts`, `order.model.ts`, `address.model.ts`, `notification.model.ts`
- Modify (import lines only): `BE/src/services/role.service.ts`, `owner.service.ts`, `menu.service.ts`, `food.service.ts`, `category.service.ts`, `shipfee.service.ts`, `notification.service.ts`, `customer.service.ts`, `address.service.ts`, `BE/src/middlewares/account.middleware.ts`, `BE/src/configs/socket.ts`, `BE/src/seeders/role.seeder.ts`, `category.seeder.ts`, `shipfee.seeder.ts`, `BE/src/jobs/voucherExpiryJob.ts`, `BE/scripts/order.service.test.ts`

**Interfaces:**
- Consumes: the merged files produced by Tasks 2–8.
- Produces: all 16 model files export by name; every import site in the repo uses named imports. No `export default` remains in `BE/src/models/`.

- [ ] **Step 1: Convert the nine single-model files to named exports**

In each of the nine files, replace the trailing `export default X` with `export { X }`. Concretely:

| File | Replace |
|---|---|
| `role.model.ts` | `export default Role` → `export { Role }` |
| `owner.model.ts` | `export default Owner` → `export { Owner }` |
| `menu.model.ts` | `export default Menu` → `export { Menu }` |
| `food.model.ts` | `export default Food` → `export { Food }` |
| `category.model.ts` | `export default Category` → `export { Category }` |
| `shipfee.model.ts` | `export default ShipFee` → `export { ShipFee }` |
| `order.model.ts` | `export default Order` → `export { Order }` |
| `address.model.ts` | `export default Address` → `export { Address }` |
| `notification.model.ts` | `export default Notification` → `export { Notification }` |

No schema, field, or index changes in this step — export line only.

- [ ] **Step 2: Convert the model imports in each service/job/middleware/config/seeder**

Replace every `import X from "../models/<file>"` with a named import from that file. The exact edits:

| File | Old imports | New import |
|---|---|---|
| `src/services/role.service.ts` | `import Role from "../models/role.model"` | `import { Role } from "../models/role.model"` |
| `src/services/owner.service.ts` | `import Owner from "../models/owner.model"`, `import User from "../models/user.model"` | `import { Owner } from "../models/owner.model"`, `import { User } from "../models/user.model"` |
| `src/services/menu.service.ts` | `import Restaurant from "../models/restaurant.model"`, `import Menu from "../models/menu.model"`, `import Food from "../models/food.model"` | `import { Restaurant } from "../models/restaurant.model"`, `import { Menu } from "../models/menu.model"`, `import { Food } from "../models/food.model"` |
| `src/services/food.service.ts` | `import Restaurant from "../models/restaurant.model"`, `import Food from "../models/food.model"`, `import Menu from "../models/menu.model"` | `import { Restaurant } from "../models/restaurant.model"`, `import { Food } from "../models/food.model"`, `import { Menu } from "../models/menu.model"` |
| `src/services/category.service.ts` | `import Category from "../models/category.model"` | `import { Category } from "../models/category.model"` |
| `src/services/shipfee.service.ts` | `import ShipFee from "../models/shipfee.model"`, `import Restaurant from "../models/restaurant.model"` | `import { ShipFee } from "../models/shipfee.model"`, `import { Restaurant } from "../models/restaurant.model"` |
| `src/services/notification.service.ts` | `import Notification from "../models/notification.model"` | `import { Notification } from "../models/notification.model"` |
| `src/services/customer.service.ts` | `import User from '../models/user.model'`, `import Address from "../models/address.model"`, `import Role from "../models/role.model"` | `import { User } from '../models/user.model'`, `import { Address } from "../models/address.model"`, `import { Role } from "../models/role.model"` |
| `src/services/address.service.ts` | `import Address from "../models/address.model"`, `import User from "../models/user.model"` | `import { Address } from "../models/address.model"`, `import { User } from "../models/user.model"` |
| `src/middlewares/account.middleware.ts` | `import User from "../models/user.model"` | `import { User } from "../models/user.model"` |
| `src/configs/socket.ts` | `import Owner from "../models/owner.model"`, `import Restaurant from "../models/restaurant.model"` | `import { Owner } from "../models/owner.model"`, `import { Restaurant } from "../models/restaurant.model"` |
| `src/seeders/role.seeder.ts` | `import Role from "../models/role.model";` | `import { Role } from "../models/role.model";` |
| `src/seeders/category.seeder.ts` | `import Category from "../models/category.model"` | `import { Category } from "../models/category.model"` |
| `src/seeders/shipfee.seeder.ts` | `import ShipFee from "../models/shipfee.model"` | `import { ShipFee } from "../models/shipfee.model"` |
| `src/jobs/voucherExpiryJob.ts` | `import Voucher from "../models/voucher.model"` | `import { Voucher } from "../models/voucher.model"` |
| `src/services/order.service.ts` | `import Owner from "../models/owner.model"`, `import Order from "../models/order.model"`, `import Address from "../models/address.model"`, `import Menu from "../models/menu.model"`, `import Food from "../models/food.model"` | `import { Owner } from "../models/owner.model"`, `import { Order } from "../models/order.model"`, `import { Address } from "../models/address.model"`, `import { Menu } from "../models/menu.model"`, `import { Food } from "../models/food.model"` |
| `src/services/auth.service.ts` | `import Role from "../models/role.model"` | `import { Role } from "../models/role.model"` |
| `src/services/driver.service.ts` | `import User from "../models/user.model"`, `import Role from "../models/role.model"` | `import { User } from "../models/user.model"`, `import { Role } from "../models/role.model"` |
| `src/services/restaurant.service.ts` | `import Category from "../models/category.model"`, `import Owner from "../models/owner.model"`, `import User from "../models/user.model"`, `import Role from "../models/role.model"` | `import { Category } from "../models/category.model"`, `import { Owner } from "../models/owner.model"`, `import { User } from "../models/user.model"`, `import { Role } from "../models/role.model"` |
| `src/services/order.service.ts` | `import Owner from "../models/owner.model"`, `import Order from "../models/order.model"`, `import Address from "../models/address.model"`, `import Menu from "../models/menu.model"`, `import Food from "../models/food.model"` | `import { Owner } from "../models/owner.model"`, `import { Order } from "../models/order.model"`, `import { Address } from "../models/address.model"`, `import { Menu } from "../models/menu.model"`, `import { Food } from "../models/food.model"` |

- [ ] **Step 3: Update `BE/scripts/order.service.test.ts` remaining imports**

Replace:
```typescript
import Food from "../src/models/food.model"
import Menu from "../src/models/menu.model"
import Address from "../src/models/address.model"
import Owner from "../src/models/owner.model"
import Role from "../src/models/role.model"
import User from "../src/models/user.model"
import ShipFee from "../src/models/shipfee.model"
```
with:
```typescript
import { Food } from "../src/models/food.model"
import { Menu } from "../src/models/menu.model"
import { Address } from "../src/models/address.model"
import { Owner } from "../src/models/owner.model"
import { Role } from "../src/models/role.model"
import { User } from "../src/models/user.model"
import { ShipFee } from "../src/models/shipfee.model"
```

`import Order from "../src/models/order.model"` becomes `import { Order } from "../src/models/order.model"`.

- [ ] **Step 4: Verify no default-export model imports remain**

Run: `cd BE && rg -n "import \w+ from .*models/" src scripts`
Expected: no matches.

Run: `cd BE && rg -n "export default" src/models`
Expected: no matches.

- [ ] **Step 5: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add BE/src/models BE/src BE/scripts/order.service.test.ts
git commit -m "refactor(be): use named exports across all model files"
```

---

## Task 10: Final verification

**Files:**
- Modify: `BE/scripts/model-manifest.ts` (import list → the 16 final model files)

**Interfaces:**
- Consumes: everything from Tasks 1–9.
- Produces: a green typecheck, a green build, a green manifest check, a green order test run, and a `models/` folder holding exactly 16 files.

- [ ] **Step 1: Point the manifest script at the 16 final model files**

Replace its import list with exactly these 16 paths, relative to `BE/scripts/`:

```
../src/models/user.model
../src/models/role.model
../src/models/owner.model
../src/models/restaurant.model
../src/models/menu.model
../src/models/food.model
../src/models/modifier.model
../src/models/category.model
../src/models/shipfee.model
../src/models/voucher.model
../src/models/cart.model
../src/models/order.model
../src/models/driver.model
../src/models/address.model
../src/models/notification.model
../src/models/wallet.model
```

Run: `cd BE && node --import tsx scripts/model-manifest.ts`
Expected: `OK: 28 models, 28 collections`, exit code 0.

- [ ] **Step 2: Confirm the models folder holds exactly 16 files**

Run: `cd BE && ls src/models | wc -l`
Expected: `16`.

Run: `cd BE && ls src/models`
Expected: `address.model.ts`, `cart.model.ts`, `category.model.ts`, `driver.model.ts`, `food.model.ts`, `menu.model.ts`, `modifier.model.ts`, `notification.model.ts`, `order.model.ts`, `owner.model.ts`, `restaurant.model.ts`, `role.model.ts`, `shipfee.model.ts`, `user.model.ts`, `voucher.model.ts`, `wallet.model.ts`.

- [ ] **Step 3: Confirm every model is still registered exactly once**

Run: `cd BE && rg -c 'mongoose\.model\(' src/models` — each file reports its model count (3 for cart/modifier/driver/restaurant/user, 2 for voucher/wallet, 1 for the rest). Confirm the counts sum to 28.

- [ ] **Step 4: Typecheck**

Run: `cd BE && npm run typecheck`
Expected: exit code 0.

- [ ] **Step 5: Build**

Run: `cd BE && npx tsc -p tsconfig.json --noEmit`
Expected: exit code 0 (the package has no `build` script; `typecheck` is the build gate).

- [ ] **Step 6: Run the order integration test**

Run: `cd BE && node --import tsx --test scripts/order.service.test.ts`
Expected: 7 tests pass, 0 fail. This exercises `populate("foodId")` in the cart path and `RestaurantSettlement` / `DriverEarning` creation on `DELIVERED`, so it proves the merged models still resolve by registered name and that the settlement/earning schemas still write correctly.

- [ ] **Step 7: Confirm no model file is left orphaned**

Run: `cd BE && rg -o --no-filename "models/[a-z_-]+\.model" src scripts | Sort-Object -Unique` and cross-check every listed path exists in `src/models/`.
Expected: every referenced model path exists; no path pointing at a deleted file.

- [ ] **Step 8: Confirm the FE is untouched**

Run: `cd FE/WEB && npm run build`
Expected: exit code 0 — the FE does not import BE model files, so it must still build unchanged.

- [ ] **Step 9: Commit**

```bash
git add BE/scripts/model-manifest.ts
git commit -m "test(be): point model manifest at consolidated model files"
```
