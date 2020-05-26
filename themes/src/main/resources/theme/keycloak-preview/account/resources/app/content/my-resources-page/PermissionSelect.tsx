import * as React from 'react';

import { Select, SelectOption, SelectVariant, SelectOptionObject } from '@patternfly/react-core';
import { Scope } from './MyResourcesPage';

interface PermissionSelectState {
  selected: ScopeValue[];
  isExpanded: boolean;
}

interface PermissionSelectProps {
  scopes: Scope[];
  onSelect: (selected: Scope[]) => void;
}

class ScopeValue implements SelectOptionObject {
  value: Scope;
  constructor(value: Scope) {
    this.value = value;
  }

  toString() {
    return this.value.displayName ? this.value.displayName : this.value.name;
  }

  compareTo(selectOption: Scope): boolean {
    return selectOption.name === this.value.name;
  }
}

export class PermissionSelect extends React.Component<PermissionSelectProps, PermissionSelectState> {
  constructor(props: PermissionSelectProps) {
    super(props);

    this.state = {
      isExpanded: false,
      selected: []
    };
  }

  private onSelect = (_event: React.MouseEvent | React.ChangeEvent, selection: ScopeValue): void => {
    const { selected } = this.state;
    const { onSelect } = this.props;
    if (selected.includes(selection)) {
      this.setState(
        prevState => ({ selected: prevState.selected.filter(item => item !== selection) }),
        () => onSelect(this.state.selected.map(sv => sv.value))
      );
    } else {
      this.setState(
        prevState => ({ selected: [...prevState.selected, selection] }),
        () => onSelect(this.state.selected.map(sv => sv.value))
      );
    }
  }

  private onToggle = (isExpanded: boolean) => {
    this.setState({
      isExpanded
    });
  }

  private clearSelection = () => {
    this.setState({
      selected: [],
      isExpanded: false
    });
  };

  render() {
    const { isExpanded, selected } = this.state;
    const titleId = 'permission-id';

    return (
      <div>
        <span id={titleId} hidden>
          Select the permissions
        </span>
        <Select
          variant={SelectVariant.typeaheadMulti}
          ariaLabelTypeAhead="Select the permissions"
          onToggle={this.onToggle}
          onSelect={this.onSelect}
          onClear={this.clearSelection}
          selections={selected}
          isExpanded={isExpanded}
          ariaLabelledBy={titleId}
          placeholderText="Select the permissions"
        >
          {this.props.scopes.map((option, index) => (
            <SelectOption key={index} value={new ScopeValue(option)} />
          ))}
        </Select>
      </div>
    );
  }
}