import RedirectClient from "./redirect-client";

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { id: string } }) {
  return <RedirectClient id={params.id} />;
}
