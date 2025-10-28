/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_items from "../admin_items.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as catalog from "../catalog.js";
import type * as consultants from "../consultants.js";
import type * as dashboard from "../dashboard.js";
import type * as dev from "../dev.js";
import type * as main from "../main.js";
import type * as manager from "../manager.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin_items: typeof admin_items;
  auth: typeof auth;
  cart: typeof cart;
  catalog: typeof catalog;
  consultants: typeof consultants;
  dashboard: typeof dashboard;
  dev: typeof dev;
  main: typeof main;
  manager: typeof manager;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
