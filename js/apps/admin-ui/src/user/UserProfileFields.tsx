import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { Form, Text } from "@patternfly/react-core";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { useFormContext } from "react-hook-form";
import { ScrollForm } from "../components/scroll-form/ScrollForm";
import { useUserProfile } from "../realm-settings/user-profile/UserProfileContext";
import { FIELDS, Field, DEFAULT_ROLES, fieldName } from "ui-shared";

type UserProfileFieldsProps = {
  roles?: string[];
};

export type UserProfileError = {
  responseData: { errors?: { errorMessage: string }[] };
};

export function isUserProfileError(error: unknown): error is UserProfileError {
  return !!(error as UserProfileError).responseData.errors;
}

export function userProfileErrorToString(error: UserProfileError) {
  return (
    error.responseData["errors"]?.map((e) => e["errorMessage"]).join("\n") || ""
  );
}

export const UserProfileFields = ({
  roles = ["admin"],
}: UserProfileFieldsProps) => {
  const { t } = useTranslation("realm-settings");
  const { config } = useUserProfile();

  return (
    <ScrollForm
      sections={[{ name: "" }, ...(config?.groups || [])].map((g) => ({
        title: g.displayHeader || g.name || t("general"),
        panel: (
          <Form>
            {g.displayDescription && (
              <Text className="pf-u-pb-lg">{g.displayDescription}</Text>
            )}
            {config?.attributes?.map((attribute) => (
              <Fragment key={attribute.name}>
                {(attribute.group || "") === g.name &&
                  (attribute.permissions?.view || DEFAULT_ROLES).some((r) =>
                    roles.includes(r),
                  ) && <FormField attribute={attribute} roles={roles} />}
              </Fragment>
            ))}
          </Form>
        ),
      }))}
    />
  );
};

type FormFieldProps = {
  attribute: UserProfileAttribute;
  roles: string[];
};

const FormField = ({ attribute, roles }: FormFieldProps) => {
  const { watch } = useFormContext();
  const value = watch(fieldName(attribute));

  const componentType = (
    attribute.annotations?.["inputType"] || Array.isArray(value)
      ? "multiselect"
      : "text"
  ) as Field;
  const Component = FIELDS[componentType];

  return <Component {...{ ...attribute, roles }} />;
};
