import { UserProfileAttribute, fieldName } from "./UserProfileAttribute";
import { useFormContext } from "react-hook-form";
import { UserProfileGroup } from "./UserProfileGroup";
import { KeycloakTextInput } from "../../keycloak-text-input/KeycloakTextInput";

export const TextComponent = (attr: UserProfileAttribute) => {
  const { register } = useFormContext();
  const inputType = attr.annotations?.["inputType"] as string | undefined;
  const type: any = inputType?.startsWith("html")
    ? inputType.substring("html".length + 2)
    : "text";

  return (
    <UserProfileGroup {...attr}>
      <KeycloakTextInput
        id={attr.name}
        data-testid={attr.name}
        type={type}
        placeholder={attr.annotations?.["inputTypePlaceholder"] as string}
        {...register(fieldName(attr))}
      />
    </UserProfileGroup>
  );
};
