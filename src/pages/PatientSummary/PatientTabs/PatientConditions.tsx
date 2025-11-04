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
import { ConditionTableData } from "@/utils/patientDetails.ts";
import useFetchConditions from "@/hooks/useFetchConditions.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { createConditionTableColumns } from "@/utils/patientDetails.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import SimpleTable from "@/components/SimpleTable.tsx";
import { PatientContext } from "@/contexts/PatientContext";

interface PatientConditionsProps {
  patientId: string;
}

function PatientConditions(props: PatientConditionsProps) {
  const { patientId } = props;
  const { linkedPatientIds } = useContext(PatientContext);

  const primaryData = useFetchConditions(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(
    ([serverUrl, patientId]) => useFetchConditions(patientId, serverUrl)
  );

  const allData = [primaryData, ...linkedData];
  const allConditions = allData
    .map((data) =>
      data.conditions.map((entry) => ({ ...entry, source: data.serverUrl }))
    )
    .flat();

  const conditionTableData: ConditionTableData[] = useMemo(() => {
    return allConditions.map((entry) => {
      let conditionText =
        entry.code?.coding?.[0].display ??
        entry.code?.text ??
        entry.code?.coding?.[0].code ??
        "*";

      if (
        entry.code?.coding?.[0].system ===
        "http://terminology.hl7.org/CodeSystem/data-absent-reason"
      ) {
        conditionText = "*" + conditionText.toLowerCase();
      }

      return {
        id: entry.id ?? nanoid(),
        condition: conditionText,
        clinicalStatus:
          entry.clinicalStatus?.coding?.[0].display ??
          entry.clinicalStatus?.text ??
          "",
        onsetDate: entry.onsetDateTime ? dayjs(entry.onsetDateTime) : null,
        recordedDate: entry.recordedDate ? dayjs(entry.recordedDate) : null,
        source: entry.source,
      };
    });
  }, [allConditions]);

  const columns = createConditionTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions</CardTitle>
        <CardDescription>
          Patient's medical history and current diagnoses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={conditionTableData}
          columns={columns}
          isLoading={allData.some((data) => data.isInitialLoading)}
          initialSorting={[{ id: "recordedDate", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientConditions;
