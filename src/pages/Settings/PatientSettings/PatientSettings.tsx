import { Card, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import PatientTable from "@/pages/Settings/PatientSettings/PatientTable.tsx";

function PatientSettings() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient</CardTitle>
          <div className="text-sm text-muted-foreground">
            Select the patient to view
          </div>
          <PatientTable />
        </CardHeader>
      </Card>
    </div>
  );
}

export default PatientSettings;
