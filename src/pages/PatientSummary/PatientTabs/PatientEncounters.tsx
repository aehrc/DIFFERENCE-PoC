import { useContext, useMemo } from "react";
import { nanoid } from "nanoid";
import {
  createEncounterTableColumns,
  EncounterTableData,
} from "@/utils/patientDetails.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import SimpleTable from "@/components/SimpleTable.tsx";
import useFetchEncounters from "@/hooks/useFetchEncounters.ts";
import { PatientContext } from "@/contexts/PatientContext";

interface PatientEncountersProps {
  patientId: string;
}

function PatientEncounters(props: PatientEncountersProps) {
  const { patientId } = props;  
  const { linkedPatientIds } = useContext(PatientContext);

  const primaryData = useFetchEncounters(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(([serverUrl, patientId]) => useFetchEncounters(patientId, serverUrl));

  const allData = [primaryData, ...linkedData];
  const allEncounters = allData.map(data => data.encounters.map(entry => ({...entry, source: data.serverUrl}))).flat()

  const encounterTableData: EncounterTableData[] = useMemo(() => {
    return allEncounters.map((entry) => ({
      id: entry.id ?? nanoid(),
      type: entry.type?.[0].coding?.[0].display ?? entry.type?.[0].text ?? "",
      class: entry.class?.display ?? entry.class.code ?? "",
      status: entry.status ?? "",
      period: entry.period ?? null,
      source: entry.source
    }));
  }, [allEncounters]);

  const columns = createEncounterTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounters</CardTitle>
        <CardDescription>
          Patient's visit history and clinical interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={encounterTableData}
          columns={columns}
          isLoading={allData.some(data => data.isInitialLoading)}
          initialSorting={[{ id: "period", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientEncounters;
