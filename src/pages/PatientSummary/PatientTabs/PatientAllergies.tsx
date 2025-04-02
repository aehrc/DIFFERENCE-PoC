import { useContext, useMemo } from "react";
import useFetchAllergyIntolerances from "@/hooks/useFetchAllergyIntolerances.ts";
import {
  AllergyTableData,
  createAllergyTableColumns,
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

interface PatientAllergiesProps {
  patientId: string;
}

function PatientAllergies(props: PatientAllergiesProps) {
  const { patientId } = props;
  const { linkedPatientIds } = useContext(PatientContext);

  const primaryData = useFetchAllergyIntolerances(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(([serverUrl, patientId]) => useFetchAllergyIntolerances(patientId, serverUrl));

  const allData = [primaryData, ...linkedData];
  const allAllergyIntolerances = allData.map(data => data.allergyIntolerances.map(entry => ({...entry, source: data.serverUrl}))).flat()


  const allergyTableData: AllergyTableData[] = useMemo(() => {
    return allAllergyIntolerances.map((entry) => {
      let allergyText =
        entry.code?.coding?.[0].display ??
        entry.code?.text ??
        entry.code?.coding?.[0].code ??
        "*";

      if (
        entry.code?.coding?.[0].system ===
        "http://terminology.hl7.org/CodeSystem/data-absent-reason"
      ) {
        allergyText = "*" + allergyText.toLowerCase();
      }

      const verificationStatusText =
        entry.verificationStatus?.coding?.[0].display ??
        entry.verificationStatus?.text ??
        entry.verificationStatus?.coding?.[0].code ??
        "";

      return {
        id: entry.id ?? nanoid(),
        allergy: allergyText,
        verificationStatus: verificationStatusText.toLowerCase(),
        category: entry.category?.[0] ?? "",
        criticality: entry.criticality ?? "",
        recordedDate: entry.recordedDate ? dayjs(entry.recordedDate) : null,
        source: entry.source
      };
    });
  }, [allAllergyIntolerances]);

  const columns = createAllergyTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergies</CardTitle>
        <CardDescription>
          Patient's documented allergic reactions and sensitivities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={allergyTableData}
          columns={columns}
          isLoading={allData.some(data => data.isInitialLoading)}
          initialSorting={[{ id: "recordedDate", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientAllergies;
