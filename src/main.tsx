import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SourceFhirServerContextProvider from "./contexts/SourceFhirServerContext.tsx";
import "@/styles/globals.css";
import { getFhirServerBaseUrl } from "./utils/misc.ts";
import { BRANDING } from "./globals.ts";

const { stylesheetUrl } = BRANDING;

if (stylesheetUrl) {
  import(/* @vite-ignore */ stylesheetUrl);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <SourceFhirServerContextProvider fhirServerUrl={getFhirServerBaseUrl()}>
      <App />
    </SourceFhirServerContextProvider>
  </QueryClientProvider>
);
