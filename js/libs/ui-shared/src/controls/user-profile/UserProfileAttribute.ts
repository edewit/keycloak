import { OptionComponent } from "./OptionsComponent";
import { SelectComponent } from "./SelectComponent";
import { TextAreaComponent } from "./TextAreaComponent";
import { TextComponent } from "./TextComponent";

const ROOT_ATTRIBUTES = ["username", "firstName", "lastName", "email"];
export const DEFAULT_ROLES = ["admin", "user"];

const isRootAttribute = (attr?: string) =>
  attr && ROOT_ATTRIBUTES.includes(attr);

export const fieldName = (attribute: UserProfileAttribute) =>
  `${isRootAttribute(attribute.name) ? "" : "attributes."}${attribute.name}`;

export type Options = {
  options: string[] | undefined;
};

export interface UserProfileAttribute {
  name?: string;
  validations?: Record<string, Record<string, unknown>>;
  annotations?: Record<string, unknown>;
  required?: UserProfileAttributeRequired;
  permissions?: UserProfileAttributePermissions;
  selector?: UserProfileAttributeSelector;
  displayName?: string;
  group?: string;
}

export interface UserProfileAttributeRequired {
  roles?: string[];
  scopes?: string[];
}
export interface UserProfileAttributePermissions {
  view?: string[];
  edit?: string[];
}
export interface UserProfileAttributeSelector {
  scopes?: string[];
}
export interface UserProfileGroup {
  name?: string;
  displayHeader?: string;
  displayDescription?: string;
  annotations?: Record<string, unknown>;
}

const FieldTypes = [
  "text",
  "textarea",
  "select",
  "select-radiobuttons",
  "multiselect",
  "multiselect-checkboxes",
  "html5-email",
  "html5-tel",
  "html5-url",
  "html5-number",
  "html5-range",
  "html5-datetime-local",
  "html5-date",
  "html5-month",
  "html5-time",
] as const;

export type Field = (typeof FieldTypes)[number];

export const FIELDS: {
  [index in Field]: (props: any) => JSX.Element;
} = {
  text: TextComponent,
  textarea: TextAreaComponent,
  select: SelectComponent,
  "select-radiobuttons": OptionComponent,
  multiselect: SelectComponent,
  "multiselect-checkboxes": OptionComponent,
  "html5-email": TextComponent,
  "html5-tel": TextComponent,
  "html5-url": TextComponent,
  "html5-number": TextComponent,
  "html5-range": TextComponent,
  "html5-datetime-local": TextComponent,
  "html5-date": TextComponent,
  "html5-month": TextComponent,
  "html5-time": TextComponent,
} as const;

export const isValidComponentType = (value: string): value is Field =>
  value in FIELDS;

export const isBundleKey = (displayName?: string) =>
  displayName?.includes("${");
export const unWrap = (key: string) => key.substring(2, key.length - 1);

export const label = (
  attribute: UserProfileAttribute,
  t: (text: string) => string,
) =>
  (isBundleKey(attribute.displayName)
    ? t(unWrap(attribute.displayName!))
    : attribute.displayName) || attribute.name;
