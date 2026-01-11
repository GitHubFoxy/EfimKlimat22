"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ConvexTestPage() {
  const items = useQuery(api.export.getAllItems);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Convex Data Export Test</h1>
      <p className="mb-4">This page demonstrates how to fetch data from Convex in real-time.</p>
      
      {items === undefined ? (
        <p>Loading items from Convex...</p>
      ) : items === null ? (
        <p>No items found.</p>
      ) : (
        <div className="space-y-4">
          <p className="font-semibold">Total items: {items.length}</p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-[600px]">
            <pre>{JSON.stringify(items.slice(0, 5), null, 2)}</pre>
          </div>
          <p className="text-sm text-slate-500 mt-2">Showing first 5 items only.</p>
        </div>
      )}
    </div>
  );
}
