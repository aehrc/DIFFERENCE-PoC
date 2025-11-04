import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import RedirectToAuthCallback from "../OAuth/RedirectToAuthCallback";
import useConfig from "@/hooks/useConfig";

function ConnectToSecondaryServerButton() {
  const [redirecting, setRedirecting] = useState(false);

  const { secondaryFhirServer } = useConfig();
  const { fhirServerUrl, oAuthGrantType } = secondaryFhirServer || {};

  if (redirecting) {
    if (oAuthGrantType === "authorization_code") {
      return <RedirectToAuthCallback baseUrl={fhirServerUrl ?? ""} />;
    }

    // Insert your own auth method here if needed
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => setRedirecting(true)}>
        Connect to secondary server
      </Button>
    </div>
  );
}

export default ConnectToSecondaryServerButton;
