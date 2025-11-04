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
  const linkedData = Object.entries(linkedPatientIds).map(
    ([serverUrl, patientId]) => useFetchEncounters(patientId, serverUrl)
  );

  const allData = [primaryData, ...linkedData];
  const allEncounters = allData
    .map((data) =>
      data.encounters.map((entry) => ({ ...entry, source: data.serverUrl }))
    )
    .flat();

  const encounterTableData: EncounterTableData[] = useMemo(() => {
    return allEncounters.map((entry) => ({
      id: entry.id ?? nanoid(),
      type: entry.type?.[0].coding?.[0].display ?? entry.type?.[0].text ?? "",
      class: entry.class?.display ?? entry.class.code ?? "",
      status: entry.status ?? "",
      period: entry.period ?? null,
      source: entry.source,
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
          isLoading={allData.some((data) => data.isInitialLoading)}
          initialSorting={[{ id: "period", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientEncounters;
