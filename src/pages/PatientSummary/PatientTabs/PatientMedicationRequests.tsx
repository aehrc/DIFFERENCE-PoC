/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useContext, useMemo } from "react";
import useFetchMedicationRequests from "@/hooks/useFetchMedicationRequests.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import {
  createMedicationRequestTableColumns,
  MedicationRequestTableData,
} from "@/utils/patientDetails.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import SimpleTable from "@/components/SimpleTable.tsx";
import { getMedicationLabel } from "@/utils/medicationText.ts";
import { PatientContext } from "@/contexts/PatientContext";
import useConfig from "@/hooks/useConfig";

interface PatientMedicationRequestsProps {
  patientId: string;
}

function PatientMedicationRequests(props: PatientMedicationRequestsProps) {
  const { patientId } = props;
  const { linkedPatientIds } = useContext(PatientContext);

  const { fhirServerUrl } = useConfig(); // Primary FHIR server URL

  const primaryData = useFetchMedicationRequests(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(
    ([serverUrl, patientId]) => useFetchMedicationRequests(patientId, serverUrl)
  );

  const allData = [primaryData, ...linkedData];
  const allMedicationRequests = allData
    .map((data) =>
      data.medicationRequests.map((entry) => ({
        ...entry,
        referencedMedications: data.referencedMedications,
        source: data.serverUrl ?? fhirServerUrl,
      }))
    )
    .flat();

  const medicationRequestTableData: MedicationRequestTableData[] =
    useMemo(() => {
      return allMedicationRequests.map((entry) => {
        const medicationText = getMedicationLabel(
          entry,
          entry.referencedMedications,
          entry.source
        );

        return {
          id: entry.id ?? nanoid(),
          medication: medicationText,
          status: entry.status ?? "",
          authoredOn: entry.authoredOn
            ? dayjs(entry.authoredOn)
            : entry._authoredOn?.extension?.find(
                (ext) =>
                  ext.url ===
                    "http://hl7.org/fhir/StructureDefinition/data-absent-reason" &&
                  !!ext.valueCode
              )?.valueCode ?? null,
          source: entry.source,
        };
      });
    }, [allMedicationRequests]);

  const columns = createMedicationRequestTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Requests</CardTitle>
        <CardDescription>
          Patient's current prescriptions and medication request history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={medicationRequestTableData}
          columns={columns}
          isLoading={allData.some((data) => data.isInitialLoading)}
          initialSorting={[{ id: "authoredOn", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientMedicationRequests;
