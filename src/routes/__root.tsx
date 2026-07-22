import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Secret Crush — Your Crush. Still a Secret. | Official Site" },
      { name: "description", content: "Secret Crush lets you add your crushes confidentially. We only reveal matches when interest is mutual. Owned and operated by ARCTURYN PRIVATE LIMITED." },
      { name: "keywords", content: "Secret Crush, secret crush app, mutual crush finder, private matching app, ARCTURYN PRIVATE LIMITED, dating app india, secret crush ahmedabad" },
      { name: "author", content: "ARCTURYN PRIVATE LIMITED" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#0f0d13" },
      { property: "og:site_name", content: "Secret Crush" },
      { property: "og:title", content: "Secret Crush — Your Crush. Still a Secret." },
      { property: "og:description", content: "Add your crushes secretly. We'll only tell you if it's mutual. Join the Secret Crush waitlist." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mysecretcrush.in" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: "https://mysecretcrush.in/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Secret Crush — Your Crush. Still a Secret." },
      { name: "twitter:description", content: "Add your crushes secretly. We'll only tell you if it's mutual." },
      { name: "twitter:image", content: "https://mysecretcrush.in/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://mysecretcrush.in" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ARCTURYN PRIVATE LIMITED",
  "legalName": "ARCTURYN PRIVATE LIMITED",
  "url": "https://mysecretcrush.in",
  "logo": "https://mysecretcrush.in/og-image.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "411, 4th Floor, SHREEYA AMALGA, Thaltej Road",
    "addressLocality": "Ahmedabad",
    "addressRegion": "Gujarat",
    "postalCode": "380054",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9978333880",
    "contactType": "customer support",
    "email": "info@mysecretcrush.in",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi", "Gujarati"]
  },
  "sameAs": [
    "https://www.instagram.com/mysecretcrush.official/"
  ]
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Secret Crush",
  "alternateName": "Secret Crush App",
  "url": "https://mysecretcrush.in",
  "applicationCategory": "SocialNetworkingApplication",
  "operatingSystem": "iOS, Android, Web",
  "description": "Secret Crush allows you to secretly add your crushes. We only notify you if the crush connection is mutual (double-opt-in). Completely private and secure.",
  "publisher": {
    "@type": "Organization",
    "name": "ARCTURYN PRIVATE LIMITED"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Secret Crush?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Secret Crush is a private social connection platform developed by ARCTURYN PRIVATE LIMITED. It lets you add your secret crushes confidentially without notifying them unless the interest is mutual."
      }
    },
    {
      "@type": "Question",
      "name": "Will my crush know I added them?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Your crush will never be notified or see that you added them unless they also secretly add you to their crush list."
      }
    },
    {
      "@type": "Question",
      "name": "Who operates Secret Crush?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Secret Crush is a brand owned and operated by ARCTURYN PRIVATE LIMITED, a technology company based in Ahmedabad, Gujarat, India."
      }
    }
  ]
};

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
