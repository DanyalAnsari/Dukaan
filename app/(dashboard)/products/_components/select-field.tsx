import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  htmlFor: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  error?: { message?: string };
  toStringValue?: (val: unknown) => string;
  fromStringValue?: (val: string) => unknown;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  htmlFor,
  placeholder,
  options,
  error,
  toStringValue = String,
  fromStringValue = (v: string) => v,
}: SelectFieldProps<T>) {
  const { field } = useController({ control, name });

  return (
    <Field>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      <Select
        value={toStringValue(field.value)}
        onValueChange={(val) => field.onChange(fromStringValue(val))}
      >
        <SelectTrigger id={htmlFor}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error?.message && <FieldError errors={[error]} />}
    </Field>
  );
}
