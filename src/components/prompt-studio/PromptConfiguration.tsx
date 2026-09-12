import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PromptCategory } from "@/data/promptStudio";

type Props = {
  category: PromptCategory;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function PromptConfiguration({ category, values, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {category.fields.map((field) => {
        const value = values[field.key] ?? "";
        const id = `${category.id}-${field.key}`;
        return (
          <div
            key={field.key}
            className={field.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}
          >
            <Label htmlFor={id} className="text-sm">
              {field.label}
            </Label>
            {field.type === "select" ? (
              <Select value={value} onValueChange={(next) => onChange(field.key, next)}>
                <SelectTrigger id={id} className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "textarea" ? (
              <Textarea
                id={id}
                value={value}
                rows={3}
                placeholder={field.placeholder ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : (
              <Input
                id={id}
                value={value}
                placeholder={field.placeholder ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
