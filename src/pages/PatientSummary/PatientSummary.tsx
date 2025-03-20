import { useContext } from "react";
import PatientContextProvider, { PatientContext } from "../../contexts/PatientContext.tsx";
import PatientCard from "@/pages/PatientSummary/PatientCard.tsx";
import PatientDetails from "@/pages/PatientSummary/PatientDetails.tsx";
import SourceFhirServerContextProvider from "@/contexts/SourceFhirServerContext.tsx";
import { humanName, getSecondaryFhirServerBaseUrl } from "@/utils/misc.ts";
import PatientSummaryWithSelection from "./PatientSummaryWithSelection.tsx";
import ConnectToSecondaryServerButton from "./ConnectToSecondaryServerButton.tsx";
import { FhirServerContext } from "@/contexts/FhirServerContext.tsx";
import { AUTH_REQUIRED_SECONDARY } from "@/globals.ts";
import { Button } from "@/components/ui/button.tsx";
import { MousePointerClick } from "lucide-react";

function PatientSummary() {
  const { selectedPatient, setSelectedPatient } = useContext(PatientContext);
  const secondaryFhirServerContext = useContext(FhirServerContext)[getSecondaryFhirServerBaseUrl()];
  const secondaryAuthMissing = getSecondaryFhirServerBaseUrl() && AUTH_REQUIRED_SECONDARY && !secondaryFhirServerContext?.accessToken;
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
            reference: `${getSecondaryFhirServerBaseUrl()}/Patient/${id}`,
          },
        });
        setSelectedPatient({...selectedPatient});
      } else {
        if (selectedPatient.link) {
          selectedPatient.link = selectedPatient.link.filter(l => l.type !== "seealso" || l.other.type !== "Patient");
          setSelectedPatient({...selectedPatient});
        }
      }
    }
  };

  let secondaryPatientId: string | undefined;
  if (selectedPatient && getSecondaryFhirServerBaseUrl()) {
    const link = selectedPatient.link?.find(l => l.type === "seealso" && l.other.type === "Patient" && l.other.reference?.startsWith(getSecondaryFhirServerBaseUrl()));
    if (link) {
      const reference = link.other.reference;
      secondaryPatientId = reference?.split("/").pop();
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
      <div className="mx-auto grid w-full gap-4">
        <div className="grid gap-6">
          <PatientCard patient={selectedPatient} />
          <div className="grid grid-flow-col auto-cols-fr gap-6">
            <div className="grid gap-6">
              <PatientDetails />
              {secondaryAuthMissing ? <ConnectToSecondaryServerButton /> : null}
            </div>
            {getSecondaryFhirServerBaseUrl() && !secondaryAuthMissing ? (
              <SourceFhirServerContextProvider fhirServerUrl={getSecondaryFhirServerBaseUrl()}>
                <PatientContextProvider patientId={secondaryPatientId}>
                  {secondaryPatientId ? (
                    <div style={{border: "solid 1px red"}}>
                      <PatientDetails />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => linkPatient()}
                        className="w-fit ml-auto"
                      >
                        Unlink Patient
                        <MousePointerClick className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <PatientSummaryWithSelection linkPatient={linkPatient} filter={nameFilter} />
                  )}
                </PatientContextProvider>
              </SourceFhirServerContextProvider>
              ) : 
              null
            }
          </div>
        </div>
      </div>
    </main>
  );
}

export default PatientSummary;
