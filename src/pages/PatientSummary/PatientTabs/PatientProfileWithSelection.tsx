import { useContext } from "react";
import { PatientContext } from "../../../contexts/PatientContext.tsx";
import PatientTable from "../../Settings/PatientSettings/PatientTable.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, Search } from "lucide-react";
import PatientProfile from "./PatientProfile.tsx";

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
        <PatientProfile />
        <div className="grid grid-flow-col gap-3 ml-auto">
          <Button
            hidden={!selectedPatient}
            size="sm"
            onClick={() => linkPatient(selectedPatient.id!)}
            className="w-fit"
          >
            <Link className="h-4 w-4 mr-2" />
            Link Patient
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectOther()}
            className="w-fit"
          >
            <Search className="h-4 w-4 mr-2" />
            Select other Patient
          </Button>
        </div>
      </div>
    ) : (
      <PatientTable updateQueryOnSelection={false} filter={filter} />
    )
  );
}

export default PatientSummaryWithSelection;
