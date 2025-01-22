import useSmartConfiguration from "@/hooks/useSmartConfiguration.ts";
import useSourceFhirServer from "./useSourceFhirServer";

export function useSupportQuestionnaireContext() {
  const { serverUrl } = useSourceFhirServer();
  const smartConfiguration = useSmartConfiguration(serverUrl);

  let scopes: string[] = [];
  if (smartConfiguration) {
    try {
      scopes = smartConfiguration.scopes_supported;
    } catch (e) {
      console.error(e);
    }
  }

  return scopes.includes("launch/questionnaire");
}

export default useSupportQuestionnaireContext;
