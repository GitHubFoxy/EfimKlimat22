"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./button";

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
};

export default function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryActions = [],
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: Action;
  secondaryActions?: Action[];
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
      {icon ? <div className="mb-4 text-gray-500">{icon}</div> : null}
      <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
      {description ? (
        <p className="text-gray-600 mb-4 max-w-prose">{description}</p>
      ) : null}

      {primaryAction ? (
        primaryAction.href ? (
          <Link href={primaryAction.href} className="mb-3">
            <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full h-11 px-5">
              {primaryAction.label}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={primaryAction.onClick}
            className="mb-3 bg-gray-900 text-white hover:bg-gray-800 rounded-full h-11 px-5"
          >
            {primaryAction.label}
          </Button>
        )
      ) : null}

      {secondaryActions.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-700">
          {secondaryActions.map((a, idx) => (
            a.href ? (
              <Link
                key={idx}
                href={a.href}
                className="px-3 py-2 rounded-md border hover:bg-gray-50"
              >
                {a.label}
              </Link>
            ) : (
              <button
                key={idx}
                className="px-3 py-2 rounded-md border hover:bg-gray-50"
                onClick={a.onClick}
              >
                {a.label}
              </button>
            )
          ))}
        </div>
      ) : null}
    </div>
  );
}