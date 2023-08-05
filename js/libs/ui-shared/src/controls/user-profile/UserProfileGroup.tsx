import { UserProfileAttribute, label } from "./UserProfileAttribute";
import { FormGroup } from "@patternfly/react-core";
import { PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import { HelpItem } from "../HelpItem";

export type UserProfileFieldsProps = UserProfileAttribute & {
  roles?: string[];
};

const isRequired = (attribute: UserProfileAttribute) =>
  Object.keys(attribute.required || {}).length !== 0 ||
  ((attribute.validations?.length?.min as number) || 0) > 0;

export const UserProfileGroup = ({
  children,
  ...attribute
}: PropsWithChildren<UserProfileFieldsProps>) => {
  //TODO what is there TODO
  const t = (text: string) => text;
  const helpText = attribute.annotations?.["inputHelperTextBefore"] as string;

  const {
    formState: { errors },
  } = useFormContext();

  return (
    <FormGroup
      key={attribute.name}
      label={label(attribute, t) || ""}
      fieldId={attribute.name}
      isRequired={isRequired(attribute)}
      validated={errors.username ? "error" : "default"}
      helperTextInvalid={t("common:required")}
      labelIcon={
        helpText ? (
          <HelpItem helpText={helpText} fieldLabelId={attribute.name!} />
        ) : undefined
      }
    >
      {children}
    </FormGroup>
  );
};
