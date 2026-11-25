# BE Models — Consolidation Design

Date: 2026-11-25
Scope: `BE/src/models/` only. No schema/field/index/collection-name changes.

## Intent

The BE currently has 28 model files for 28 Mongo collections. Several of those files
split one domain across multiple files for no structural reason (e.g. a child table
living alone in its own file while its parent lives next door). The goal is a folder
where one domain/resource maps to one file, so that reading `cart.model.ts` tells you
everything about the cart domain without hunting through sibling files.

## Goals

- One domain/resource per `.model.ts` file.
- Dependent schemas that only ever exist to support that domain live in the same file.
- Consistent file naming across the folder.
- Nothing about the database changes: same schemas, same fields, same indexes, same
  collection names, same behaviour.

## Non-goals

- No schema redesign. No field added, removed, renamed, or retyped.
- No index changes. No collection renames (which would orphan existing data).
- No change to how services/controllers use these models, beyond import paths.
- No new validation, no new virtuals, no new middleware hooks.

## Anti-goals

- A single giant `models/index.ts` mega-file. Domains stay separated.
- Splitting one domain across several files "just because each schema is small".
- Renaming the MongoDB collections as part of the tidy-up.

## Constraints

- `mongoose.model("Name", schema)` calls must keep the exact same first argument. That
  string is the collection name source, so changing it would create a new empty
  collection and orphan the existing one.
- Existing indexes must be re-declared identically in the new files.
- Every import site has to be updated: 9 service files, 1 job, 1 socket, 3 seeders,
  1 config, 1 test script.

## Approaches considered

### Approach A — group by domain, named exports (chosen)

Merge dependent schemas into their parent's file, rename files to snake_case, and
export every model from a file as a named export.

- Files: 28 → 15.
- Import sites change from `import Cart from "../models/cart.model"` to
  `import { Cart, CartItem, CartItemOption } from "../models/cart.model"`.
- Trade-off: named exports mean touching every import line, but they make it obvious
  that a file holds several models, and they allow two files to be imported without
  two import statements.

### Approach B — group by domain, keep `export default` per file in one barrel

Merge schemas into one file but re-export each model from its own thin file, so
import paths stay untouched.

- Files: 28 → 15 real + 15 thin shims.
- Trade-off: leaves two files per domain on disk forever, and the folder still looks
  split. Rejected — the whole point is the folder stops looking split.

### Approach C — group by domain, `export default` an object

One file exports `{ Cart, CartItem, CartItemOption }` as default.

- Trade-off: `import models from "../models/cart.model"` then `models.Cart` is noisier
  at every use site and breaks the existing one-model-per-import idiom. Rejected.

## The parts of the how, as decided

- **Grouping:** each domain's dependent schemas merge into the domain's file.
- **Role, Address, Notification:** reviewed for merging into `user.model.ts` and kept
  separate — each has its own route, service, or seeder and is used independently of
  User. See "Models reviewed and deliberately kept separate".
- **Auth grouping:** `OTP` and `RefreshToken` merge into `user.model.ts`. Both are
  `ref: "User"`, both are used only by `auth.service.ts`, and both have TTL indexes
  that self-delete. `Role` stays separate because it has its own route and service.
- **Financial tables:** `DriverEarning` merges into `driver.model.ts`;
  `RestaurantSettlement` merges into `restaurant.model.ts`. Both are per-order
  financial rows tied to their parent's lifecycle.
- **File naming:** snake_case everywhere, matching the existing
  `modifier_group.model.ts` / `wallet_transaction.model.ts` style. The two kebab-case
  outliers (`restaurant-settlement.model.ts`, `driver-earning.model.ts`) get renamed
  as part of the merge anyway.
- **Exports:** named exports per file. `export default` is dropped entirely. A file
  with one model exports it by name too (`export { Food }`), so every model file has
  the same shape.

## Final structure

```
BE/src/models/
├── user.model.ts            User, OTP, RefreshToken
├── role.model.ts            Role
├── owner.model.ts           Owner
├── restaurant.model.ts      Restaurant, RestaurantCategory, RestaurantSettlement
├── menu.model.ts            Menu
├── food.model.ts            Food
├── modifier.model.ts        ModifierGroup, ModifierOption, FoodModifierGroup
├── category.model.ts        Category
├── shipfee.model.ts         ShipFee
├── voucher.model.ts         Voucher, VoucherUsage
├── cart.model.ts            Cart, CartItem, CartItemOption
├── order.model.ts           Order (already embeds orderItem/orderAddress/orderItemOption)
├── driver.model.ts          Driver, DriverLocation, DriverEarning
├── address.model.ts         Address
├── notification.model.ts    Notification
└── wallet.model.ts          Wallet, WalletTransaction
```

16 files, 28 models. `Order` needs no change — its sub-schemas are already embedded
sub-documents in one file, which is the pattern the whole folder converges on.

## Model-to-file map

| Model | New file |
|---|---|
| User, OTP, RefreshToken | `user.model.ts` |
| Role | `role.model.ts` |
| Owner | `owner.model.ts` |
| Restaurant, RestaurantCategory, RestaurantSettlement | `restaurant.model.ts` |
| Menu | `menu.model.ts` |
| Food | `food.model.ts` |
| ModifierGroup, ModifierOption, FoodModifierGroup | `modifier.model.ts` |
| Category | `category.model.ts` |
| ShipFee | `shipfee.model.ts` |
| Voucher, VoucherUsage | `voucher.model.ts` |
| Cart, CartItem, CartItemOption | `cart.model.ts` |
| Order | `order.model.ts` |
| Driver, DriverLocation, DriverEarning | `driver.model.ts` |
| Address | `address.model.ts` |
| Notification | `notification.model.ts` |
| Wallet, WalletTransaction | `wallet.model.ts` |

## Models reviewed and deliberately kept separate

Not every small file is a candidate for merging. Three were reviewed and kept as
their own files:

- **`role.model.ts`** — has its own route (`GET /roles`), its own service, its own
  seeder, and is a lookup table read independently of any user.
- **`address.model.ts`** — full CRUD resource (`POST /addresses`, `GET /addresses/me`,
  `PATCH /addresses/:id`, `PATCH /addresses/:id/default`, `DELETE /addresses/:id`).
  Address is a saved destination list, not a field on User.
- **`notification.model.ts`** — has its own service and its own util
  (`notification.util.ts`), and is written to independently of User through the socket
  layer.

Also kept separate, for the same reason (own route + own service + independently
usable): `owner`, `menu`, `food`, `category`, `shipfee`, `order`, `notification`.

`menu` and `food` both belong to a restaurant's catalogue but stay apart: an owner
creates menus without creating any food, `Food` references `menuId`, and each has its
own route prefix. Merging them would produce a ~95-line file holding two models with
no direct dependency.

## Files deleted after merge

`cart_item.model.ts`, `cart_item_option.model.ts`, `modifier_group.model.ts`,
`modifier_option.model.ts`, `food_modifier_group.model.ts`, `driver_location.model.ts`,
`driver-earning.model.ts`, `restaurant_category.model.ts`,
`restaurant-settlement.model.ts`, `voucher_usage.model.ts`, `wallet_transaction.model.ts`,
`otp.model.ts`, `refresh_token.model.ts`.

## Import sites to update

**Every** file that imports from `models/` changes, because the export style moves
from `export default` to named exports — including files whose model stays alone in
its own file.

Full list of files with a `models/` import today (18 source files + 1 test script):

- `src/services/auth.service.ts` — User, OTP, RefreshToken
- `src/services/cart.service.ts` — Cart, CartItem, CartItemOption, FoodModifierGroup, ModifierGroup, ModifierOption
- `src/services/driver.service.ts` — Driver, DriverLocation
- `src/services/order.service.ts` — VoucherUsage, RestaurantSettlement, DriverEarning, Cart, CartItem, CartItemOption, Wallet, WalletTransaction
- `src/services/restaurant.service.ts` — RestaurantCategory
- `src/services/voucher.service.ts` — Voucher
- `src/services/wallet.service.ts` — Wallet, WalletTransaction
- `src/services/modifier.service.ts` — ModifierGroup, ModifierOption, FoodModifierGroup
- `src/services/menu.service.ts` — Menu, Food, Restaurant
- `src/services/food.service.ts` — Food, Menu, Restaurant
- `src/services/customer.service.ts` — User, Address, Role
- `src/services/address.service.ts` — Address, User
- `src/services/owner.service.ts` — Owner, User
- `src/services/category.service.ts` — Category
- `src/services/shipfee.service.ts` — ShipFee, Restaurant
- `src/services/notification.service.ts` — Notification
- `src/services/role.service.ts` — Role
- `src/jobs/walletTransactionJob.ts` — WalletTransaction
- `src/jobs/voucherExpiryJob.ts` — Voucher
- `src/sockets/driver.socket.ts` — Driver, DriverLocation
- `src/middlewares/account.middleware.ts` — User
- `src/configs/socket.ts` — Owner, Restaurant
- `src/seeders/role.seeder.ts`, `category.seeder.ts`, `shipfee.seeder.ts`
- `scripts/order.service.test.ts` — all of the above

## Implementation constraints the builder must respect

- **No cross-imports between model files.** Every `ref` in the codebase is already a
  string (`ref: "ModifierOption"`, `ref: "Order"`, …), and mongoose resolves string
  refs lazily at populate time. Merging must not introduce `import { X } from
  "./x.model"` inside a model file — that risks a circular import between
  `modifier.model.ts` and `food.model.ts` with no benefit.
- **Model registration order inside a merged file** should follow dependency order
  (parent first): `Cart, CartItem, CartItemOption`; `ModifierGroup, ModifierOption,
  FoodModifierGroup`; `Driver, DriverLocation, DriverEarning`; `User, OTP,
  RefreshToken`; `Restaurant, RestaurantCategory, RestaurantSettlement`; `Voucher,
  VoucherUsage`; `Wallet, WalletTransaction`.
- **Index declarations move verbatim.** Every `schema.index(...)` line stays exactly
  as it is, attached to the same schema.


## Verification

- `npm run typecheck` in `BE` must exit 0.
- `npm run build` in `BE` must exit 0.
- Grep for `mongoose.model(` — must still be exactly 28 occurrences, with the same
  model names and no renames.
- Grep for `models/` imports — must be zero unresolved paths.
- No change to `mongoose.model("X", ...)` first arguments, so collection names are
  unchanged by construction.
- Spot-check that a `populate("foodId")` and a `populate("categoryId")` still resolve:
  these depend on the model *name* registered with mongoose, not on the file a model
  lives in, so the merge must not rename any registered model.

## What's left for the builder

Move the schema blocks, preserve every field and index verbatim, change the export
style, update the import sites listed above, delete the merged-away files, run the
verification commands.
