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
import useFetchImmunizations from "@/hooks/useFetchImmunizations.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import {
  createImmunizationTableColumns,
  ImmunizationTableData,
} from "@/utils/patientDetails.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import SimpleTable from "@/components/SimpleTable.tsx";
import { PatientContext } from "@/contexts/PatientContext";

interface Props {
  patientId: string;
}

function PatientImmunizations(props: Props) {
  const { patientId } = props;
  const { linkedPatientIds } = useContext(PatientContext);

  const primaryData = useFetchImmunizations(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(
    ([serverUrl, patientId]) => useFetchImmunizations(patientId, serverUrl)
  );

  const allData = [primaryData, ...linkedData];
  const allImmunizations = allData
    .map((data) =>
      data.immunizations.map((entry) => ({ ...entry, source: data.serverUrl }))
    )
    .flat();

  const immunizationTableData: ImmunizationTableData[] = useMemo(() => {
    return allImmunizations.map((entry) => {
      let immunizationText =
        entry.vaccineCode?.coding?.[0].display ??
        entry.vaccineCode?.text ??
        entry.vaccineCode?.coding?.[0].code ??
        "*";

      if (
        entry.vaccineCode?.coding?.[0].system ===
        "http://terminology.hl7.org/CodeSystem/data-absent-reason"
      ) {
        immunizationText = "*" + immunizationText.toLowerCase();
      }

      return {
        id: entry.id ?? nanoid(),
        immunization: immunizationText,
        status: entry.status ?? "",
        occurrenceDate: entry.occurrenceDateTime
          ? dayjs(entry.occurrenceDateTime)
          : null,
        source: entry.source,
      };
    });
  }, [allImmunizations]);

  const columns = createImmunizationTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Immunisations</CardTitle>
        <CardDescription>
          Patient's record of vaccinations and immunisation history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={immunizationTableData}
          columns={columns}
          isLoading={allData.some((data) => data.isInitialLoading)}
          initialSorting={[{ id: "occurrenceDate", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientImmunizations;
