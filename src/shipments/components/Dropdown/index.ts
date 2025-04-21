import { Dropdown as DropdownBase } from "./dropdown";
import { DropdownTrigger } from "./dropdown-trigger";
import { DropdownOptions } from "./dropdown-options";
import { DropdownOption } from "./dropdown-option";
import { DropdownErrorMessage } from "./dropdown-error-message";
import { DropdownLabel } from "./dropdown-label";
import type { DropdownOptionType } from "./context/dropdown-context";

type DropdownComponent = typeof DropdownBase & {
  Label: typeof DropdownLabel;
  Trigger: typeof DropdownTrigger;
  Options: typeof DropdownOptions;
  Option: typeof DropdownOption;
  ErrorMessage: typeof DropdownErrorMessage;
};

const Dropdown = DropdownBase as DropdownComponent;
Dropdown.Label = DropdownLabel;
Dropdown.Trigger = DropdownTrigger;
Dropdown.Options = DropdownOptions;
Dropdown.Option = DropdownOption;
Dropdown.ErrorMessage = DropdownErrorMessage;

export { Dropdown };
export type { DropdownOptionType };
