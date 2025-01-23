import { useContext } from "react";
import PatientContextProvider, { PatientContext } from "../../contexts/PatientContext.tsx";
import PatientCard from "@/pages/PatientSummary/PatientCard.tsx";
import PatientDetails from "@/pages/PatientSummary/PatientDetails.tsx";
import SourceFhirServerContextProvider from "@/contexts/SourceFhirServerContext.tsx";
import { getSecondaryFhirServerBaseUrl } from "@/utils/misc.ts";
import PatientSummaryWithSelection from "./PatientSummaryWithSelection.tsx";

function PatientSummary() {
  const { selectedPatient } = useContext(PatientContext);

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
            <PatientDetails />
            {getSecondaryFhirServerBaseUrl() ? (
              <SourceFhirServerContextProvider fhirServerUrl={getSecondaryFhirServerBaseUrl()}>
                <PatientContextProvider patientId={secondaryPatientId}>
                  {secondaryPatientId ? (
                    <PatientDetails />
                  ) : (
                    <PatientSummaryWithSelection />
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
