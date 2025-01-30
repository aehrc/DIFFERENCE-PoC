import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { OAUTH_SECONDARY } from "@/globals";
import RedirectToAuthCallback from "../OAuth/RedirectToAuthCallback";
import { getSecondaryFhirServerBaseUrl } from "@/utils/misc";

function ConnectToSecondaryServerButton() {
  const [redirecting, setRedirecting] = useState(false);

  if (redirecting) {
    if (OAUTH_SECONDARY.grantType === "authorization_code") {
      return <RedirectToAuthCallback baseUrl={getSecondaryFhirServerBaseUrl()} />;
    }

    // Insert your own auth method here if needed
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => setRedirecting(true)}
      >
        Connect to secondary server
      </Button>
    </div>
  );
}

export default ConnectToSecondaryServerButton;
