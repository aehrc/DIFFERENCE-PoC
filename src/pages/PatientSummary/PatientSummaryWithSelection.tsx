import { useContext } from "react";
import { PatientContext } from "../../contexts/PatientContext.tsx";
import PatientDetails from "@/pages/PatientSummary/PatientDetails.tsx";
import PatientTable from "../Settings/PatientSettings/PatientTable.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MousePointerClick } from "lucide-react";

interface PatientSummaryWithSelectionProps {
  linkPatient: (id?:string) => void;
  filter?: string;
}
function PatientSummaryWithSelection({ linkPatient, filter }: PatientSummaryWithSelectionProps) {
  const { selectedPatient, setSelectedPatient } = useContext(PatientContext);

  const selectOther = () => {
    linkPatient();
    setSelectedPatient(null);
  };

  return (
    selectedPatient ? (
      <div className="grid gap-6">
      <PatientDetails />
      <div className="grid grid-flow-col gap-1">
      <Button
        hidden={!selectedPatient}
        variant="outline"
        size="sm"
        onClick={() => linkPatient(selectedPatient.id!)}
        className="w-fit ml-auto"
      >
        Link Patient
        <MousePointerClick className="h-4 w-4 ml-2" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectedPatient(null)}
        className="w-fit ml-auto"
      >
        Select other Patient
        <MousePointerClick className="h-4 w-4 ml-2" />
      </Button>
      </div>
      </div>
    ) : (
      <PatientTable updateQueryOnSelection={false} filter={filter} />
    )
  );
}

export default PatientSummaryWithSelection;
