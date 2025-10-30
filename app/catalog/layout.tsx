// This layout is a Server Component and sets segment config for the catalog route
export const dynamic = "force-dynamic";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}