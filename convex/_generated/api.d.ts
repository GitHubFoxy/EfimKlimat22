/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as cart from "../cart.js";
import type * as catalog from "../catalog.js";
import type * as clearItems from "../clearItems.js";
import type * as collection_groups_manager from "../collection_groups_manager.js";
import type * as consultants from "../consultants.js";
import type * as dashboard from "../dashboard.js";
import type * as debug from "../debug.js";
import type * as export_ from "../export.js";
import type * as http from "../http.js";
import type * as import_ from "../import.js";
import type * as main from "../main.js";
import type * as manager from "../manager.js";
import type * as migrations from "../migrations.js";
import type * as migrations_backfill_collection_field from "../migrations/backfill_collection_field.js";
import type * as migrations_convert_power_to_segments from "../migrations/convert_power_to_segments.js";
import type * as migrations_init_collection_groups from "../migrations/init_collection_groups.js";
import type * as orders from "../orders.js";
import type * as test_category_filter from "../test_category_filter.js";
import type * as users from "../users.js";
import type * as validation from "../validation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  cart: typeof cart;
  catalog: typeof catalog;
  clearItems: typeof clearItems;
  collection_groups_manager: typeof collection_groups_manager;
  consultants: typeof consultants;
  dashboard: typeof dashboard;
  debug: typeof debug;
  export: typeof export_;
  http: typeof http;
  import: typeof import_;
  main: typeof main;
  manager: typeof manager;
  migrations: typeof migrations;
  "migrations/backfill_collection_field": typeof migrations_backfill_collection_field;
  "migrations/convert_power_to_segments": typeof migrations_convert_power_to_segments;
  "migrations/init_collection_groups": typeof migrations_init_collection_groups;
  orders: typeof orders;
  test_category_filter: typeof test_category_filter;
  users: typeof users;
  validation: typeof validation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
