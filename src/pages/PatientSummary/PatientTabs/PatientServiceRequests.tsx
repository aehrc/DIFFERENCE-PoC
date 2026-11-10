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
import dayjs from "dayjs";
import {
  codeableConceptText,
  createServiceRequestTableColumns,
  ServiceRequestTableData,
} from "@/utils/patientDetails.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import SimpleTable from "@/components/SimpleTable.tsx";
import useFetchServiceRequests from "@/hooks/useFetchServiceRequests.ts";
import { PatientContext } from "@/contexts/PatientContext";

interface PatientServiceRequestsProps {
  patientId: string;
}

function PatientServiceRequests(props: PatientServiceRequestsProps) {
  const { patientId } = props;
  const { linkedPatientIds } = useContext(PatientContext);

  const primaryData = useFetchServiceRequests(patientId);
  const linkedData = Object.entries(linkedPatientIds).map(
    ([serverUrl, patientId]) => useFetchServiceRequests(patientId, serverUrl)
  );

  const allData = [primaryData, ...linkedData];
  const allServiceRequests = allData
    .map((data) =>
      data.serviceRequests.map((entry) => ({
        ...entry,
        source: data.serverUrl,
      }))
    )
    .flat();

  const serviceRequestTableData: ServiceRequestTableData[] = useMemo(() => {
    return allServiceRequests.map((entry) => {
      // Category (e.g. 3457005 referral, 108252007 pathology) distinguishes the kinds
      const category = (entry.category ?? [])
        .map(codeableConceptText)
        .filter(Boolean)
        .join(", ");

      const performer = [
        codeableConceptText(entry.performerType),
        ...(entry.performer ?? []).map((ref) => ref.display ?? ""),
      ]
        .filter(Boolean)
        .join(", ");

      const dateString =
        entry.authoredOn ??
        entry.occurrenceDateTime ??
        entry.occurrencePeriod?.start;

      return {
        id: entry.id ?? nanoid(),
        request: codeableConceptText(entry.code) || "*",
        category,
        status: entry.status ?? "",
        performer,
        requester: entry.requester?.display ?? "",
        date: dateString ? dayjs(dateString) : null,
        source: entry.source,
      };
    });
  }, [allServiceRequests]);

  const columns = createServiceRequestTableColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Requests</CardTitle>
        <CardDescription>
          Patient's referrals, pathology requests and other service requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={serviceRequestTableData}
          columns={columns}
          isLoading={allData.some((data) => data.isInitialLoading)}
          initialSorting={[{ id: "date", desc: true }]}
        />
      </CardContent>
    </Card>
  );
}

export default PatientServiceRequests;
