import { FhirServerContext } from "@/contexts/FhirServerContext";
import PatientContextProvider, {
  PatientContext,
} from "@/contexts/PatientContext";
import { humanName } from "@/utils/misc";
import { useContext } from "react";
import ConnectToSecondaryServerButton from "../ConnectToSecondaryServerButton";
import { Button } from "@/components/ui/button";
import SourceFhirServerContextProvider from "@/contexts/SourceFhirServerContext";
import { Unlink } from "lucide-react";
import PatientSummaryWithSelection from "./PatientProfileWithSelection";
import PatientProfile from "./PatientProfile";
import useConfig from "@/hooks/useConfig";

function DualPatientProfile() {
  const { secondaryFhirServer } = useConfig();
  const secondaryFhirServerUrl = secondaryFhirServer?.fhirServerUrl || "";
  const { selectedPatient, updatePatient } = useContext(PatientContext);
  const secondaryFhirServerContext =
    useContext(FhirServerContext)[secondaryFhirServerUrl];
  const secondaryAuthMissing =
    secondaryFhirServerUrl &&
    secondaryFhirServerContext?.authRequired &&
    !secondaryFhirServerContext?.accessToken;
  const nameFilter = selectedPatient ? humanName(selectedPatient) : undefined;

  const linkPatient = (id?: string) => {
    if (selectedPatient) {
      if (id) {
        if (!selectedPatient.link) {
          selectedPatient.link = [];
        }
        selectedPatient.link.push({
          type: "seealso",
          other: {
            type: "Patient",
            reference: `${secondaryFhirServerUrl}/Patient/${id}`,
          },
        });
        updatePatient(selectedPatient);
      } else {
        if (selectedPatient.link) {
          selectedPatient.link = selectedPatient.link.filter(
            (l) => l.type !== "seealso" || l.other.type !== "Patient"
          );
          updatePatient(selectedPatient);
        }
      }
    }
  };

  let secondaryPatientId: string | undefined;
  if (selectedPatient && secondaryFhirServerUrl) {
    const link = selectedPatient.link?.find(
      (l) =>
        l.type === "seealso" &&
        l.other.type === "Patient" &&
        l.other.reference?.startsWith(secondaryFhirServerUrl)
    );
    if (link) {
      const reference = link.other.reference;
      secondaryPatientId = reference?.split("/").pop();
    }
  }

  return (
    <div className="grid grid-flow-col auto-cols-fr gap-6">
      <div className="grid gap-6">
        <PatientProfile />
        {secondaryAuthMissing ? <ConnectToSecondaryServerButton /> : null}
      </div>
      {secondaryFhirServerUrl && !secondaryAuthMissing ? (
        <SourceFhirServerContextProvider fhirServerUrl={secondaryFhirServerUrl}>
          <PatientContextProvider patientId={secondaryPatientId}>
            {secondaryPatientId ? (
              <div className="grid gap-6">
                <PatientProfile />
                <div className="grid grid-flow-col gap-3 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => linkPatient()}
                    className="w-fit ml-auto"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Unlink Patient
                  </Button>
                </div>
              </div>
            ) : (
              <PatientSummaryWithSelection
                linkPatient={linkPatient}
                filter={nameFilter}
              />
            )}
          </PatientContextProvider>
        </SourceFhirServerContextProvider>
      ) : null}
    </div>
  );
}

export default DualPatientProfile;
