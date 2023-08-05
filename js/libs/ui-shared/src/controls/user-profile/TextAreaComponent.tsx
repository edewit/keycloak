import { UserProfileAttribute, fieldName } from "./UserProfileAttribute";
import { useFormContext } from "react-hook-form";
import { UserProfileGroup } from "./UserProfileGroup";
import { KeycloakTextArea } from "../keycloak-text-area/KeycloakTextArea";

export const TextAreaComponent = (attr: UserProfileAttribute) => {
  const { register } = useFormContext();

  return (
    <UserProfileGroup {...attr}>
      <KeycloakTextArea
        id={attr.name}
        data-testid={attr.name}
        {...register(fieldName(attr))}
        cols={attr.annotations?.["inputTypeCols"] as number}
        rows={attr.annotations?.["inputTypeRows"] as number}
      />
    </UserProfileGroup>
  );
};
