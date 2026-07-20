import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Secret Crush — Add Crushes Secretly | Mutual Match App by ARCTURYN PRIVATE LIMITED" },
      { name: "description", content: "Secret Crush allows you to add your crushes confidentially. We only notify you if the crush connection is mutual (double-opt-in). Operated by ARCTURYN PRIVATE LIMITED." },
      { property: "og:title", content: "Secret Crush — Add Crushes Secretly | Mutual Match App" },
      { property: "og:description", content: "Add your crushes secretly. We'll only tell you if it's mutual. Join the Secret Crush waitlist." },
      { property: "og:url", content: "https://mysecretcrush.in/" },
    ],
    links: [
      { rel: "canonical", href: "https://mysecretcrush.in/" },
    ],
  }),
  component: Landing,
});
