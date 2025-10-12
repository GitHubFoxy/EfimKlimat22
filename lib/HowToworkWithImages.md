# How to Work with Images Using Convex

This guide explains end-to-end patterns for handling images with Convex: uploading from the client, storing on the server, saving references in your tables, serving images back to clients, and deleting/cleaning up.

## Core Concepts
- `ctx.storage.store(blob)`: Persist a file (Blob/ArrayBuffer) into Convex Storage. Returns `Id<_storage>`.
- `ctx.storage.get(storageId)`: Retrieve the stored file as a Blob for serving via HTTP Actions.
- `ctx.storage.getUrl(storageId)`: Generate a public URL that serves the stored file. Useful in queries/mutations when you want clients to load images via HTTPS.
- Upload URLs: Generate short‑lived URLs on the client to upload directly from the browser without routing the binary through your server function.

## Recommended Workflow
1) Client selects an image file.
2) Client requests a short‑lived upload URL from a Convex mutation.
3) Client POSTs the file directly to that upload URL.
4) Server returns a `storageId` (Id<"_storage">).
5) Client calls a mutation to save the `storageId` and any metadata (e.g., item name) into your table.

This flow is scalable, secure, and avoids large payloads hitting your function handlers.

## Client: Upload via Upload URL
```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ImageUploader() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveItemImage = useMutation(api.items.saveItemImage);

  async function onFileSelected(file: File) {
    // 1) Generate short‑lived upload URL
    const postUrl = await generateUploadUrl();
    // 2) Upload the file directly
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    // 3) Persist reference in your table
    await saveItemImage({ storageId /*, itemId, alt, etc. */ });
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => e.target.files && onFileSelected(e.target.files[0])}
    />
  );
}
```

## Server: Mutations and Actions

### Generate an Upload URL
```ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

### Save the Image Reference
```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveItemImage = mutation({
  args: { storageId: v.id("_storage"), itemId: v.optional(v.id("items")) },
  handler: async (ctx, { storageId, itemId }) => {
    // Example: Store storageId on the item document
    if (itemId) {
      await ctx.db.patch(itemId, { imageStorageId: storageId });
    } else {
      await ctx.db.insert("images", { storageId });
    }
  },
});
```

### Store a File Inside an Action (Server‑Side fetch)
```ts
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const downloadAndStore = action({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const storageId = await ctx.storage.store(blob);
    await ctx.runMutation(internal.images.saveRemoteImage, { storageId });
  },
});

export const saveRemoteImage = internalMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await ctx.db.insert("images", { storageId });
  },
});
```

## Serving Images to Clients

### Generate a URL in Queries
```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    return { url };
  },
});
```

### Serve Raw Blob via HTTP Action
```ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const storageId = new URL(req.url).searchParams.get("storageId") as Id<"_storage">;
    const blob = await ctx.storage.get(storageId);
    if (!blob) return new Response("Not found", { status: 404 });
    return new Response(blob);
  }),
});

export default http;
```

## Displaying Images in Next.js
- If you have a URL from `getUrl`, pass it to `<Image src={url} ... />` or `<img src={url} ... />`.
- For blob serving via HTTP Action, use your route URL (e.g., `/convex/getImage?storageId=...`).

## Deleting Images
```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await ctx.storage.delete(storageId);
  },
});
```

## Best Practices
- Validate types: use `v.id("_storage")` for storage IDs.
- Store `storageId` on your content documents to keep DB → storage references.
- Prefer upload URLs for browser uploads to avoid large request bodies in mutations.
- Use actions for server‑side downloads or transformations.
- Consider adding `alt` text and basic metadata to improve accessibility.
- Use `getUrl` for simple public serving; use HTTP Actions when you need custom headers or access control.
- Handle errors and timeouts: upload POST has ~2‑minute timeout; HTTP Action body size limit is ~20MB.

## Troubleshooting
- 404 when serving: ensure the `storageId` exists and the file wasn’t deleted.
- CORS issues on upload: always POST to the exact upload URL and set `Content-Type` to the file’s MIME type.
- Broken images: check that the saved `storageId` matches the document and you’re generating URLs correctly.