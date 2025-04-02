import { useContext, useMemo } from "react";
import useFetchProcedures from "@/hooks/useFetchProcedures.ts";
import {
  createProcedureTableColumns,
  ProcedureTableData,
} from "@/utils/patientDetails.tsx";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import SimpleTable from "@/components/SimpleTable.tsx";
import { PatientContext } from "@/contexts/PatientContext";

interface PatientProceduresProps {
  patientId: string;
}

function PatientProcedures(props: PatientProceduresProps) {
  const { patientId } = props;  
  const { linkedPatientIds } = useContext(PatientContext);

  const primaryData = useFetchProcedures(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(([serverUrl, patientId]) => useFetchProcedures(patientId, serverUrl));

  const allData = [primaryData, ...linkedData];
  const allProcedures = allData.map(data => data.procedures.map(entry => ({...entry, source: data.serverUrl}))).flat()

  const procedureTableData: ProcedureTableData[] = useMemo(() => {
    return allProcedures.map((entry) => {
      let procedureText =
        entry.code?.coding?.[0].display ??
        entry.code?.text ??
        entry.code?.coding?.[0].code ??
        "*";

      if (
        entry.code?.coding?.[0].system ===
        "http://terminology.hl7.org/CodeSystem/data-absent-reason"
      ) {
        procedureText = "*" + procedureText.toLowerCase();
      }

      const performedPeriodStart = entry.performedPeriod?.start
        ? dayjs(entry.performedPeriod.start)
        : null;
      const performedDateTime = entry.performedDateTime
        ? dayjs(entry.performedDateTime)
        : null;
      const performedOn = performedPeriodStart ?? performedDateTime ?? null;

      return {
        id: entry.id ?? nanoid(),
        procedure: procedureText,
        status: entry.status ?? "",
        reason:
          entry.reasonCode?.[0].coding?.[0].display ??
          entry.reasonCode?.[0].text ??
          "",
        performedOn: performedOn,
        source: entry.source
      };
    });
  }, [allProcedures]);

  const columns = createProcedureTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procedures</CardTitle>
        <CardDescription>
          Patient's records of past surgeries and medical procedures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={procedureTableData}
          columns={columns}
          isLoading={allData.some(data => data.isInitialLoading)}
          initialSorting={[{ id: "performedOn", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientProcedures;
