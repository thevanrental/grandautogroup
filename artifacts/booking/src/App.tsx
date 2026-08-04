import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AdminCalendar from "@/pages/admin-calendar";
import Confirmation from "@/pages/confirmation";

const queryClient = new QueryClient();

// REQUIRED — resolves key from hostname so dev + prod use the right key automatically
const configuredClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkPubKey = configuredClerkKey
  ? publishableKeyFromHost(window.location.hostname, configuredClerkKey)
  : null;

// REQUIRED — empty in dev (intentional), auto-set in prod
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(356, 80%, 47%)",
    colorForeground: "hsl(0, 0%, 96%)",
    colorMutedForeground: "hsl(0, 0%, 55%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 9%)",
    colorInput: "hsl(0, 0%, 14%)",
    colorInputForeground: "hsl(0, 0%, 96%)",
    colorNeutral: "hsl(0, 0%, 20%)",
    fontFamily: "'Barlow', sans-serif",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[hsl(0,0%,9%)] rounded-sm w-[440px] max-w-full overflow-hidden border border-[hsl(0,0%,16%)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold uppercase tracking-widest",
    headerSubtitle: "text-[hsl(0,0%,55%)]",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-[hsl(0,0%,80%)] text-sm font-semibold uppercase tracking-wide",
    footerActionLink: "text-[hsl(356,80%,55%)] hover:text-[hsl(356,80%,65%)]",
    footerActionText: "text-[hsl(0,0%,55%)]",
    dividerText: "text-[hsl(0,0%,55%)]",
    identityPreviewEditButton: "text-[hsl(356,80%,55%)]",
    formFieldSuccessText: "text-[hsl(356,80%,55%)]",
    alertText: "text-white",
    logoBox: "flex justify-center mb-2",
    logoImage: "h-14 w-auto",
    socialButtonsBlockButton: "bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] hover:bg-[hsl(0,0%,17%)] text-white",
    formButtonPrimary: "bg-[hsl(356,80%,47%)] hover:bg-[hsl(356,80%,55%)] text-white font-bold uppercase tracking-widest !shadow-none",
    formFieldInput: "bg-[hsl(0,0%,14%)] border-[hsl(0,0%,22%)] text-white",
    footerAction: "bg-[hsl(0,0%,7%)] border-t border-[hsl(0,0%,14%)]",
    dividerLine: "bg-[hsl(0,0%,20%)]",
    alert: "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,20%)]",
    otpCodeFieldInput: "bg-[hsl(0,0%,14%)] border-[hsl(0,0%,22%)] text-white",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </div>
  );
}

/** Wrap admin pages: redirect to sign-in when not authenticated */
function AdminGuard({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

/** Invalidate React Query cache when the signed-in user changes */
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Staff Portal",
            subtitle: "Sign in to manage appointments",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/admin">
              {() => <AdminGuard component={Admin} />}
            </Route>
            <Route path="/admin/calendar">
              {() => <AdminGuard component={AdminCalendar} />}
            </Route>
            <Route path="/confirmation/:id" component={Confirmation} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  // The marketing site is intentionally available without Clerk. This keeps
  // the public site online on static hosts while admin remains disabled until
  // a deployment provides the Clerk environment variables and API backend.
  if (!clerkPubKey) {
    return (
      <WouterRouter base={basePath}>
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    );
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
