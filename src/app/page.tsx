import { Metadata } from "next";
import { PasteForm } from "@/components/paste/paste-form";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)]">
      <PasteForm />
    </div>
  );
}
