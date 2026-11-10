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

import dayjs, { Dayjs } from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import {
  CodeableConcept,
  Observation,
  ObservationComponent,
  ObservationReferenceRange,
  Period,
  Quantity,
} from "fhir/r4";
import { Workflow } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MedicationLabel } from "@/utils/medicationText.ts";

interface TableData {
  source?: string;
}

// Encounter functions and types
export interface EncounterTableData extends TableData {
  id: string;
  type: string;
  class: string;
  status: string;
  period: Period | null;
}

export function createEncounterTableColumns(): ColumnDef<EncounterTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex">
          <div className="font-medium">{row.getValue("type") ?? "-"}</div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => (
        <div className="flex">
          <div className="capitalize">{row.getValue("class") ?? "-"}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") ? (
          <Badge variant="outline">{row.getValue("status")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "period",
      header: "Period",
      sortingFn: (a, b) => {
        const dateOrMax = (date: string | undefined) =>
          date ? dayjs(date) : dayjs("9999-12-31");

        // Compare start dates first
        const aStart = dateOrMax(a.original.period?.start);
        const bStart = dateOrMax(b.original.period?.start);

        if (aStart.isBefore(bStart)) return -1;
        if (aStart.isAfter(bStart)) return 1;

        // If start dates are equal, compare end dates
        const aEnd = dateOrMax(a.original.period?.end);
        const bEnd = dateOrMax(b.original.period?.end);

        if (aEnd.isBefore(bEnd)) return -1;
        if (aEnd.isAfter(bEnd)) return 1;

        return 0;
      },
      cell: ({ row }) => {
        const { start, end } = row.original.period || {};

        if (start && end) {
          return `
              ${dayjs(start).format("DD/MM/YYYY")} - 
              ${dayjs(end).format("DD/MM/YYYY")}`;
        } else if (start) {
          return dayjs(start).format("DD/MM/YYYY");
        } else if (end) {
          return `Unknown - ${dayjs(end).format("DD/MM/YYYY")}`;
        } else {
          return "-";
        }
      },
    },
  ];
}

// Condition functions and types
export interface ConditionTableData extends TableData {
  id: string;
  condition: string;
  clinicalStatus: string;
  onsetDate: Dayjs | null;
  recordedDate: Dayjs | null;
}

export function createConditionTableColumns(): ColumnDef<ConditionTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "condition",
      header: "Condition",
      cell: ({ row }) => (
        <div className="flex">
          <div className="font-medium">{row.getValue("condition") ?? "-"}</div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "clinicalStatus",
      header: "Clinical Status",
      cell: ({ row }) =>
        row.getValue("clinicalStatus") ? (
          <Badge variant="outline">{row.getValue("clinicalStatus")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "onsetDate",
      header: "Onset Date",
      cell: ({ row }) => {
        return row.original.onsetDate
          ? row.original.onsetDate.format("DD/MM/YYYY")
          : "-";
      },
    },
    {
      accessorKey: "recordedDate",
      header: "Recorded Date",
      sortingFn: (a, b) => {
        if (
          a.original.recordedDate === null ||
          b.original.recordedDate === null
        ) {
          return 0;
        }

        return a.original.recordedDate.diff(b.original.recordedDate);
      },
      cell: ({ row }) => {
        return row.original.recordedDate
          ? row.original.recordedDate.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

// MedicationRequest functions and types
export interface MedicationRequestTableData extends TableData {
  id: string;
  medication: MedicationLabel;
  status: string;
  intent: string;
  dosage: string;
  reason: string[];
  authoredOn: Dayjs | string | null;
}

export function createMedicationRequestTableColumns(): ColumnDef<MedicationRequestTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "medication",
      header: "Medication",
      cell: ({ row }) => {
        const { text, source, referenceLink } = row.getValue(
          "medication"
        ) as MedicationLabel;
        return (
          <div className="flex min-w-[280px]">
            <div className="space-y-1">
              <div className="font-medium">{text ?? "-"}</div>
              {source ? (
                <div className="text-xs text-muted-foreground">
                  From: {source}{" "}
                  {referenceLink ? (
                    <span className="text-xs text-muted-foreground">
                      -{" "}
                      <a
                        href={referenceLink}
                        title={referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View referenced Medication
                      </a>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    createBadgeColumn("intent", "Intent"),
    createTextColumn("dosage", "Dosage"),
    createTextListColumn("reason", "Reason"),
    createBadgeColumn("status", "Status"),
    {
      accessorKey: "authoredOn",
      header: "Authored On",
      sortingFn: (a, b) => {
        if (
          a.original.authoredOn === null ||
          b.original.authoredOn === null ||
          typeof a.original.authoredOn === "string" ||
          typeof b.original.authoredOn === "string"
        ) {
          return 0;
        }

        return a.original.authoredOn.diff(b.original.authoredOn);
      },
      cell: ({ row }) => {
        if (typeof row.original.authoredOn === "string") {
          return "*" + row.original.authoredOn;
        }

        return row.original.authoredOn
          ? row.original.authoredOn.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

// MedicationRequest functions and types
export interface MedicationStatementTableData extends TableData {
  id: string;
  medication: MedicationLabel;
  status: string;
  dosage: string;
  reasonCode: string;
  effective: Dayjs | null;
}

export function createMedicationStatementTableColumns(): ColumnDef<MedicationStatementTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "medication",
      header: "Medication",
      cell: ({ row }) => {
        const { text, source, referenceLink } = row.getValue(
          "medication"
        ) as MedicationLabel;
        return (
          <div className="flex min-w-[390px]">
            <div className="space-y-1">
              <div className="font-medium">{text ?? "-"}</div>
              {source ? (
                <div className="text-xs text-muted-foreground">
                  From: {source}{" "}
                  {referenceLink ? (
                    <span className="text-xs text-muted-foreground">
                      -{" "}
                      <a
                        href={referenceLink}
                        title={referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View referenced Medication
                      </a>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") ? (
          <Badge variant="outline">{row.getValue("status")}</Badge>
        ) : (
          "-"
        ),
    },
    createTextColumn("dosage", "Dosage"),
    createTextColumn("reasonCode", "Reason Code"),
    {
      accessorKey: "effective",
      header: "Effective",
      sortingFn: (a, b) => {
        if (a.original.effective === null || b.original.effective === null) {
          return 0;
        }

        return a.original.effective.diff(b.original.effective);
      },
      cell: ({ row }) => {
        return row.original.effective
          ? row.original.effective.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

// AllergyIntolerances functions and types
export interface AllergyTableData extends TableData {
  id: string;
  allergy: string;
  verificationStatus: string;
  category: string;
  criticality: string;
  recordedDate: Dayjs | null;
}

export function createAllergyTableColumns(): ColumnDef<AllergyTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "allergy",
      header: "Allergy",
      cell: ({ row }) => (
        <div className="flex">
          <div className="font-medium">{row.getValue("allergy") ?? "-"}</div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "verificationStatus",
      header: "Verification Status",
      cell: ({ row }) =>
        row.getValue("verificationStatus") ? (
          <Badge variant="outline">{row.getValue("verificationStatus")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) =>
        row.getValue("category") ? row.getValue("category") : "-",
    },
    {
      accessorKey: "criticality",
      header: "Criticality",
      cell: ({ row }) =>
        row.getValue("criticality") ? (
          <Badge variant="outline">{row.getValue("criticality")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "recordedDate",
      header: "Recorded Date",
      sortingFn: (a, b) => {
        if (
          a.original.recordedDate === null ||
          b.original.recordedDate === null
        ) {
          return 0;
        }

        return a.original.recordedDate.diff(b.original.recordedDate);
      },
      cell: ({ row }) => {
        return row.original.recordedDate
          ? row.original.recordedDate.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

// Procedures functions and types
export interface ProcedureTableData extends TableData {
  id: string;
  procedure: string;
  status: string;
  reason: string;
  performedOn: Dayjs | null;
}

export function createProcedureTableColumns(): ColumnDef<ProcedureTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "procedure",
      header: "Procedure",
      cell: ({ row }) => (
        <div className="flex">
          <div className="font-medium">{row.getValue("procedure") ?? "-"}</div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") ? (
          <Badge variant="outline">{row.getValue("status")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) =>
        row.getValue("reason") ? row.getValue("reason") : "-",
    },
    {
      accessorKey: "performedOn",
      header: "Performed On",
      sortingFn: (a, b) => {
        if (
          a.original.performedOn === null ||
          b.original.performedOn === null
        ) {
          return 0;
        }

        return a.original.performedOn.diff(b.original.performedOn);
      },
      cell: ({ row }) => {
        return row.original.performedOn
          ? row.original.performedOn.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

// Immunizations functions and types
export interface ImmunizationTableData extends TableData {
  id: string;
  immunization: string;
  status: string;
  occurrenceDate: Dayjs | null;
}

export function createImmunizationTableColumns(): ColumnDef<ImmunizationTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "immunization",
      header: "Immunization",
      cell: ({ row }) => (
        <div className="flex">
          <div className="font-medium">
            {row.getValue("immunization") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") ? (
          <Badge variant="outline">{row.getValue("status")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) =>
        row.getValue("reason") ? row.getValue("reason") : "-",
    },
    {
      accessorKey: "occurrenceDate",
      header: "Occurrence Date",
      sortingFn: (a, b) => {
        if (
          a.original.occurrenceDate === null ||
          b.original.occurrenceDate === null
        ) {
          return 0;
        }

        return a.original.occurrenceDate.diff(b.original.occurrenceDate);
      },
      cell: ({ row }) => {
        return row.original.occurrenceDate
          ? row.original.occurrenceDate.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

// Observations functions and types
export interface ObservationTableData extends TableData {
  id: string;
  observation: string;
  status: string;
  category: string;
  valueData: string | number | (string | number)[];
  interpretation: ObservationInterpretation[];
  referenceRange: string[];
  effectiveDateTime: Dayjs | string | null;
}

export interface ObservationInterpretation {
  code: string;
  label: string;
}

export function createObservationTableColumns(): ColumnDef<ObservationTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "observation",
      header: "Observation",
      cell: ({ row }) => (
        <div className="flex max-w-64">
          <div className="font-medium">
            {row.getValue("observation") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex max-w-64">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("status") ? (
          <Badge variant="outline">{row.getValue("status")}</Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.getValue("category") ?? "-",
    },
    {
      accessorKey: "valueData",
      header: "Value(s)",
      cell: ({ row }) => {
        const valueData = row.getValue("valueData") as
          | string
          | number
          | (string | number)[];

        if (Array.isArray(valueData)) {
          return (
            <div className="flex flex-col gap-5">
              {valueData.map((value) => {
                if (typeof value === "string") {
                  return (
                    <div key={value}>
                      {value.includes(": ") ? (
                        <div className="min-w-40">
                          <div className="font-medium">
                            {value.split(": ")[0] ?? ""}
                          </div>
                          <div className="text-muted-foreground">
                            {value.split(": ")[1] ?? ""}
                          </div>
                        </div>
                      ) : (
                        <div key={value} className="text-muted-foreground">
                          {value ?? "-"}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={value} className="text-muted-foreground">
                    {value ?? "-"}
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <div key={valueData} className="text-muted-foreground">
            {valueData ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "interpretation",
      header: "Interpretation",
      enableSorting: false,
      cell: ({ row }) => {
        const interpretations = row.original.interpretation;
        if (interpretations.length === 0) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {interpretations.map(({ code, label }) => (
              <Badge
                key={code + label}
                variant={
                  ABNORMAL_INTERPRETATION_CODES.has(code)
                    ? "destructive"
                    : "outline"
                }
                title={label}
              >
                {code || label}
              </Badge>
            ))}
          </div>
        );
      },
    },
    createTextListColumn("referenceRange", "Reference Range"),
    {
      accessorKey: "effectiveDateTime",
      header: "Effective Date Time",
      sortingFn: (a, b) => {
        if (
          a.original.effectiveDateTime === null ||
          b.original.effectiveDateTime === null ||
          typeof a.original.effectiveDateTime === "string" ||
          typeof b.original.effectiveDateTime === "string"
        ) {
          return 0;
        }

        return a.original.effectiveDateTime.diff(b.original.effectiveDateTime);
      },
      cell: ({ row }) => {
        if (typeof row.original.effectiveDateTime === "string") {
          return row.original.effectiveDateTime;
        }

        return row.original.effectiveDateTime
          ? row.original.effectiveDateTime.format("DD/MM/YYYY")
          : "-";
      },
    },
  ];
}

export function getObservationValueData(observation: Observation) {
  const observationValue = getObservationOrComponentValue(observation);
  if (observationValue !== null) {
    return observationValue;
  }

  if (observation.component) {
    return observation.component
      .map((component) => {
        // Get value
        const componentValue = getObservationOrComponentValue(component);
        if (componentValue === null) {
          return null;
        }

        // Append code display to value if it exists
        if (component.code) {
          const componentDisplay =
            component.code?.coding?.[0].display ?? component.code?.text ?? "";
          return componentDisplay + ": " + componentValue;
        }

        // Otherwise, return value only
        return componentValue;
      })
      .filter((value): value is string | number => value !== null);
  }

  return "";
}

export function getObservationOrComponentValue(
  item: Observation | ObservationComponent
) {
  if (item.valueQuantity) {
    let valueQuantityText = item.valueQuantity.value ?? "";
    if (item.valueQuantity.comparator) {
      valueQuantityText =
        item.valueQuantity.comparator + " " + valueQuantityText;
    }

    // Add unit if it exists
    if (item.valueQuantity.unit) {
      valueQuantityText = valueQuantityText + " " + item.valueQuantity.unit;
    }

    // If valueQuantityText is available at this point, return it
    if (valueQuantityText) {
      return valueQuantityText;
    }

    const dataAbsentReason = item.valueQuantity.extension?.find(
      (ext) =>
        ext.url === "http://hl7.org/fhir/StructureDefinition/data-absent-reason"
    )?.valueCode;
    if (dataAbsentReason) {
      return "*" + dataAbsentReason;
    }

    return "*";
  }

  if (item.valueCodeableConcept) {
    const valueText =
      item.valueCodeableConcept.coding?.[0].display ??
      item.valueCodeableConcept.text ??
      item.valueCodeableConcept.coding?.[0].code ??
      "";

    if (
      item.valueCodeableConcept.coding?.[0].system ===
      "http://terminology.hl7.org/CodeSystem/data-absent-reason"
    ) {
      return "*" + valueText.toLowerCase();
    }

    return valueText;
  }

  if (item.valueRange) {
    let valueRangeLowText = item.valueRange.low?.value ?? "*";
    if (item.valueRange.low?.unit) {
      valueRangeLowText += " " + item.valueRange.low.unit;
    }

    let valueRangeHighText = item.valueRange.high?.value ?? "*";
    if (item.valueRange.high?.unit) {
      valueRangeHighText += " " + item.valueRange.high.unit;
    }

    return `${valueRangeLowText} - ${valueRangeHighText}`;
  }

  if (item.valueString) {
    return item.valueString;
  }

  if (item.dataAbsentReason) {
    const dataAbsentReason =
      item.dataAbsentReason.coding?.[0].code ??
      item.dataAbsentReason.text ??
      "";
    return "*" + dataAbsentReason;
  }

  return null;
}

// v3-ObservationInterpretation codes that flag a result as outside normal
const ABNORMAL_INTERPRETATION_CODES = new Set([
  "A",
  "AA",
  "H",
  "HH",
  "HU",
  "L",
  "LL",
  "LU",
  ">",
  "<",
  "POS",
  "DET",
  "R",
  "W",
]);

export function getObservationInterpretations(
  observation: Observation
): ObservationInterpretation[] {
  return (observation.interpretation ?? []).map((concept) => {
    const coding = concept.coding?.[0];
    return {
      code: coding?.code ?? "",
      label: coding?.display ?? concept.text ?? coding?.code ?? "",
    };
  });
}

function quantityText(quantity: Quantity | undefined): string {
  if (quantity?.value === undefined) return "";
  return [quantity.comparator, quantity.value, quantity.unit]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
}

export function getObservationReferenceRanges(
  observation: Observation
): string[] {
  return (observation.referenceRange ?? [])
    .map((range: ObservationReferenceRange) => {
      const low = quantityText(range.low);
      const high = quantityText(range.high);
      let bounds = "";
      if (low && high) {
        // Avoid repeating the unit when both bounds share it
        const lowValue =
          range.low?.unit && range.low.unit === range.high?.unit
            ? [range.low.comparator, range.low.value].filter(Boolean).join(" ")
            : low;
        bounds = `${lowValue} – ${high}`;
      } else if (low) {
        bounds = `≥ ${low}`;
      } else if (high) {
        bounds = `≤ ${high}`;
      }

      const text = range.text?.trim() ?? "";
      if (bounds && text && text !== bounds) return `${bounds} (${text})`;
      return bounds || text;
    })
    .filter(Boolean);
}

// ServiceRequest functions and types
export interface ServiceRequestTableData extends TableData {
  id: string;
  request: string;
  category: string;
  status: string;
  performer: string;
  requester: string;
  date: Dayjs | null;
}

export function createServiceRequestTableColumns(): ColumnDef<ServiceRequestTableData>[] {
  return [
    createSourceServerColumn(),
    {
      accessorKey: "request",
      header: "Request",
      cell: ({ row }) => (
        <div className="flex min-w-[280px]">
          <div>{row.getValue("request") || "-"}</div>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex max-w-64">
          <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            {row.getValue("id") ?? "-"}
          </div>
        </div>
      ),
    },
    createTextColumn("category", "Category"),
    createBadgeColumn("status", "Status"),
    createTextColumn("performer", "Performer"),
    createTextColumn("requester", "Requester"),
    {
      accessorKey: "date",
      header: "Date",
      sortingFn: (a, b) => {
        if (a.original.date === null || b.original.date === null) {
          return 0;
        }

        return a.original.date.diff(b.original.date);
      },
      cell: ({ row }) =>
        row.original.date ? row.original.date.format("DD/MM/YYYY") : "-",
    },
  ];
}

// Shared helpers

// Display text for a CodeableConcept: coding display, then text, then code
export function codeableConceptText(
  concept: CodeableConcept | undefined
): string {
  if (!concept) return "";
  const coding = concept.coding?.find((c) => c.display) ?? concept.coding?.[0];
  return coding?.display ?? concept.text ?? coding?.code ?? "";
}

function createTextColumn<T extends TableData>(
  key: keyof T & string,
  header: string
): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    cell: ({ row }) =>
      row.getValue(key) ? (
        <div className="flex">
          <div>{row.getValue(key) as string}</div>
        </div>
      ) : (
        "-"
      ),
  };
}

function createTextListColumn<T extends TableData>(
  key: keyof T & string,
  header: string
): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    enableSorting: false,
    cell: ({ row }) => {
      const values = row.getValue(key) as string[];
      if (!values || values.length === 0) return "-";
      return (
        <div className="flex flex-col gap-1 min-w-32">
          {values.map((value, index) => (
            <div key={index}>{value}</div>
          ))}
        </div>
      );
    },
  };
}

function createBadgeColumn<T extends TableData>(
  key: keyof T & string,
  header: string
): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    cell: ({ row }) =>
      row.getValue(key) ? (
        <Badge variant="outline">{row.getValue(key) as string}</Badge>
      ) : (
        "-"
      ),
  };
}

function createSourceServerColumn<T extends TableData>(): ColumnDef<T> {
  return {
    accessorKey: "source",
    header: "",
    cell: ({ row }) =>
      row.getValue("source") ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Workflow className="w-5 h-5" />
          </TooltipTrigger>
          <TooltipContent side="right">
            <b>Source: </b>
            {row.getValue("source")}
          </TooltipContent>
        </Tooltip>
      ) : null,
  };
}
