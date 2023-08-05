import { Select, SelectOption } from "@patternfly/react-core";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { DEFAULT_ROLES, fieldName, Options } from "./UserProfileAttribute";
import { UserProfileFieldsProps, UserProfileGroup } from "./UserProfileGroup";

export const SelectComponent = ({
  roles = [],
  ...attribute
}: UserProfileFieldsProps) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  const options =
    (attribute.validations?.options as Options | undefined)?.options || [];
  return (
    <UserProfileGroup {...attribute}>
      <Controller
        name={fieldName(attribute)}
        defaultValue=""
        control={control}
        render={({ field }) => (
          <Select
            toggleId={attribute.name}
            onToggle={(b) => setOpen(b)}
            onSelect={(_, value) => {
              const option = value.toString();
              if (Array.isArray(field.value)) {
                if (field.value.includes(option)) {
                  field.onChange(
                    field.value.filter((item: string) => item !== option),
                  );
                } else {
                  field.onChange([...field.value, option]);
                }
              } else {
                field.onChange(option);
                setOpen(false);
              }
            }}
            selections={field.value ? field.value : "Choose"}
            variant={Array.isArray(field.value) ? "typeaheadmulti" : "single"}
            aria-label="select one"
            isOpen={open}
            isDisabled={
              !(attribute.permissions?.edit || DEFAULT_ROLES).some((r) =>
                roles.includes(r),
              )
            }
          >
            {options.map((option) => (
              <SelectOption
                selected={field.value === option}
                key={option}
                value={option}
              >
                {option}
              </SelectOption>
            ))}
          </Select>
        )}
      />
    </UserProfileGroup>
  );
};
