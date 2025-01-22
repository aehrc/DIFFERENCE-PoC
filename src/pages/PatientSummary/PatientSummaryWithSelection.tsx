import { useContext } from "react";
import { PatientContext } from "../../contexts/PatientContext.tsx";
import PatientDetails from "@/pages/PatientSummary/PatientDetails.tsx";
import PatientTable from "../Settings/PatientSettings/PatientTable.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MousePointerClick } from "lucide-react";

function PatientSummaryWithSelection() {
  const { selectedPatient, setSelectedPatient } = useContext(PatientContext);

  return (
    selectedPatient ? (
      <div className="grid gap-6">
      <PatientDetails patient={selectedPatient} />

      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectedPatient(null)}
        className="w-fit ml-auto"
      >
        Select Patient
        <MousePointerClick className="h-4 w-4 ml-2" />
      </Button>
      </div>
    ) : (
      <PatientTable updateQueryOnSelection={false} />
    )
  );
}

export default PatientSummaryWithSelection;
