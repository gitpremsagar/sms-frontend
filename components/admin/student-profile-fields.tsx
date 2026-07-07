import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export type StudentProfileFormValues = {
  admissionDate: string;
  motherName: string;
  fatherName: string;
  studentAadharNumber: string;
  fatherAadharNumber: string;
  motherAadharNumber: string;
  dateOfBirth: string;
  whatsappNumber: string;
  contactNumber1: string;
  contactNumber2: string;
  isStudying: boolean;
};

export const emptyStudentProfileValues: StudentProfileFormValues = {
  admissionDate: "",
  motherName: "",
  fatherName: "",
  studentAadharNumber: "",
  fatherAadharNumber: "",
  motherAadharNumber: "",
  dateOfBirth: "",
  whatsappNumber: "",
  contactNumber1: "",
  contactNumber2: "",
  isStudying: true,
};

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function toOptionalDatePayload(value: string): string | null {
  return value.trim() ? value : null;
}

type StudentProfileFieldsProps = {
  values: StudentProfileFormValues;
  onChange: <K extends keyof StudentProfileFormValues>(
    field: K,
    value: StudentProfileFormValues[K],
  ) => void;
};

export function StudentProfileFields({
  values,
  onChange,
}: StudentProfileFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="admissionDate">Admission Date</Label>
        <Input
          id="admissionDate"
          type="date"
          value={values.admissionDate}
          onChange={(event) => onChange("admissionDate", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={values.dateOfBirth}
          onChange={(event) => onChange("dateOfBirth", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motherName">Mother&apos;s Name</Label>
        <Input
          id="motherName"
          value={values.motherName}
          onChange={(event) => onChange("motherName", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fatherName">Father&apos;s Name</Label>
        <Input
          id="fatherName"
          value={values.fatherName}
          onChange={(event) => onChange("fatherName", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentAadharNumber">Student Aadhar Number</Label>
        <Input
          id="studentAadharNumber"
          value={values.studentAadharNumber}
          onChange={(event) =>
            onChange("studentAadharNumber", event.target.value)
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fatherAadharNumber">Father Aadhar Number</Label>
        <Input
          id="fatherAadharNumber"
          value={values.fatherAadharNumber}
          onChange={(event) =>
            onChange("fatherAadharNumber", event.target.value)
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motherAadharNumber">Mother Aadhar Number</Label>
        <Input
          id="motherAadharNumber"
          value={values.motherAadharNumber}
          onChange={(event) =>
            onChange("motherAadharNumber", event.target.value)
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">Whatsapp Number</Label>
        <Input
          id="whatsappNumber"
          value={values.whatsappNumber}
          onChange={(event) => onChange("whatsappNumber", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber1">Contact Number 1</Label>
        <Input
          id="contactNumber1"
          value={values.contactNumber1}
          onChange={(event) => onChange("contactNumber1", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber2">Contact Number 2</Label>
        <Input
          id="contactNumber2"
          value={values.contactNumber2}
          onChange={(event) => onChange("contactNumber2", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="isStudying">Is Studying</Label>
        <select
          id="isStudying"
          value={values.isStudying ? "true" : "false"}
          onChange={(event) =>
            onChange("isStudying", event.target.value === "true")
          }
          className={selectClassName}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  );
}

export function toStudentProfilePayload(values: StudentProfileFormValues) {
  return {
    admissionDate: toOptionalDatePayload(values.admissionDate),
    motherName: values.motherName.trim() || null,
    fatherName: values.fatherName.trim() || null,
    studentAadharNumber: values.studentAadharNumber.trim() || null,
    fatherAadharNumber: values.fatherAadharNumber.trim() || null,
    motherAadharNumber: values.motherAadharNumber.trim() || null,
    dateOfBirth: toOptionalDatePayload(values.dateOfBirth),
    whatsappNumber: values.whatsappNumber.trim() || null,
    contactNumber1: values.contactNumber1.trim() || null,
    contactNumber2: values.contactNumber2.trim() || null,
    isStudying: values.isStudying,
  };
}

export function studentToProfileValues(student: {
  admissionDate?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  studentAadharNumber?: string | null;
  fatherAadharNumber?: string | null;
  motherAadharNumber?: string | null;
  dateOfBirth?: string | null;
  whatsappNumber?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
  isStudying?: boolean;
}): StudentProfileFormValues {
  return {
    admissionDate: toDateInputValue(student.admissionDate),
    motherName: student.motherName ?? "",
    fatherName: student.fatherName ?? "",
    studentAadharNumber: student.studentAadharNumber ?? "",
    fatherAadharNumber: student.fatherAadharNumber ?? "",
    motherAadharNumber: student.motherAadharNumber ?? "",
    dateOfBirth: toDateInputValue(student.dateOfBirth),
    whatsappNumber: student.whatsappNumber ?? "",
    contactNumber1: student.contactNumber1 ?? "",
    contactNumber2: student.contactNumber2 ?? "",
    isStudying: student.isStudying ?? true,
  };
}
