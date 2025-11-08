"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-white" />,
        info: <InfoIcon className="size-5 text-white" />,
        warning: <TriangleAlertIcon className="size-5 text-white" />,
        error: <OctagonXIcon className="size-5 text-white" />,
        loading: <Loader2Icon className="size-5 animate-spin text-white" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border bg-white text-blackish shadow-lg group-[.dark]:bg-blackish group-[.dark]:text-foreground group-[.dark]:border-border",
          title: "font-medium",
          description: "text-sm text-muted-foreground",
          actionButton:
            "rounded-full bg-light-orange text-white hover:bg-dark-orange",
          cancelButton:
            "rounded-full bg-blackish text-white hover:bg-blackish/80 group-[.dark]:bg-white group-[.dark]:text-black",
          closeButton: "text-muted-foreground hover:text-foreground",
          icon: "",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
          // Brand-rich colors for statuses
          "--success-bg": "var(--color-light-orange)",
          "--success-text": "white",
          "--success-border": "var(--color-dark-orange)",
          "--info-bg": "var(--color-blackish)",
          "--info-text": "white",
          "--warning-bg": "var(--color-dark-orange)",
          "--warning-text": "white",
          "--error-bg": "var(--color-redish)",
          "--error-text": "white",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
