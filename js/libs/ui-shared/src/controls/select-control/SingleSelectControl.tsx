import {
  MenuToggle,
  MenuToggleStatus,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { get } from "lodash-es";
import { useState } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { FormLabel } from "../FormLabel";
import {
  SelectControlProps,
  isSelectBasedOptions,
  isString,
  key,
} from "./SelectControl";

export const SingleSelectControl = <
  T extends FieldValues,
  P extends FieldPath<T> = FieldPath<T>,
>({
  id,
  name,
  label,
  options,
  controller,
  labelIcon,
  ...rest
}: SelectControlProps<T, P>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [open, setOpen] = useState(false);

  const convert = () =>
    options.map((option) => (
      <SelectOption key={key(option)} value={key(option)}>
        {isString(option) ? option : option.value}
      </SelectOption>
    ));

  return (
    <FormLabel
      name={name}
      label={label}
      isRequired={!!controller.rules?.required}
      error={get(errors, name)}
      labelIcon={labelIcon}
    >
      <Controller
        {...controller}
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            {...rest}
            onClick={() => setOpen(!open)}
            selected={
              isSelectBasedOptions(options)
                ? options
                    .filter((o) =>
                      Array.isArray(value)
                        ? value.includes(o.key)
                        : value === o.key,
                    )
                    .map((o) => o.value)
                : value
            }
            toggle={(ref) => (
              <MenuToggle
                id={id || name.slice(name.lastIndexOf(".") + 1)}
                ref={ref}
                onClick={() => setOpen(!open)}
                isExpanded={open}
                isFullWidth
                status={get(errors, name) ? MenuToggleStatus.danger : undefined}
              >
                {isSelectBasedOptions(options)
                  ? options.find((o) => o.key === value)?.value
                  : value}
              </MenuToggle>
            )}
            onSelect={(event, v) => {
              event?.stopPropagation();
              if (Array.isArray(value)) {
                const option = v?.toString();
                const selected = key(option!);
                if (value.includes(key)) {
                  onChange(value.filter((item: string) => item !== selected));
                } else {
                  onChange([...value, option]);
                }
              } else {
                onChange(v);
                setOpen(false);
              }
            }}
            isOpen={open}
          >
            <SelectList>{convert()}</SelectList>
          </Select>
        )}
      />
    </FormLabel>
  );
};