import { useContext } from "react";
import RedirectToAuthCallback from "@/pages/OAuth/RedirectToAuthCallback.tsx";
import DashboardLayout from "@/layout/DashboardLayout.tsx";
import { FhirServerContext } from "@/contexts/FhirServerContext.tsx";
import InitialPatientSelection from "@/pages/InitialPatientSelection.tsx";
import InitialUserSelection from "@/pages/InitialUserSelection.tsx";
import useLauncherQuery from "@/hooks/useLauncherQuery.ts";
import useLoadResources from "@/hooks/useLoadResources.ts";
import { AUTH_REQUIRED, OAUTH } from "@/globals.ts";
import { getFhirServerBaseUrl } from "@/utils/misc";

function Home() {
  const fhirServerContext = useContext(FhirServerContext);
  const { accessToken, fhirUser } = fhirServerContext[getFhirServerBaseUrl()];

  useLoadResources();

  const { launch } = useLauncherQuery();
  const launchUser = launch.provider;
  const launchPatient = launch.patient;

  // Use AUTH_REQUIRED to determine if authorisation is required. If not authenticated, redirect to AuthCallback
  // If no grant type is set, app assumes no auth is needed and proceeds to user/patient selection
  if (AUTH_REQUIRED === true && accessToken === "") {
    if (OAUTH.grantType === "authorization_code") {
      return <RedirectToAuthCallback baseUrl={getFhirServerBaseUrl()} />;
    }

    // Insert your own auth method here if needed
  }

  // No user selected, redirect to user selection screen
  const fhirUserIsPractitioner =
    fhirUser && fhirUser.startsWith("Practitioner");
  if (!launchUser && !fhirUserIsPractitioner) {
    return <InitialUserSelection />;
  }

  // No patient selected, redirect to patient selection screen
  if (!launchPatient) {
    return <InitialPatientSelection />;
  }

  return <DashboardLayout />;
}

export default Home;
