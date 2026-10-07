import type { Metadata } from "next";
import { SavedView } from "@/components/saved/saved-view";

export const metadata: Metadata = {
  title: "Saved",
  description: "Saved crypto articles and collections stored in this browser.",
};

export default function SavedPage() {
  return <SavedView />;
}
