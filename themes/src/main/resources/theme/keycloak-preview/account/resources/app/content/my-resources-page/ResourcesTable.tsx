/*
 * Copyright 2018 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';

import {
    DataList,
    DataListItem,
    DataListItemRow,
    DataListCell,
    DataListToggle,
    DataListContent,
    DataListItemCells,
    Level,
    LevelItem,
    Stack,
    StackItem,
    Button,
    EmptyState,
    EmptyStateVariant,
    Title,
    EmptyStateIcon,
    DataListAction,
    DataListActionVisibility,
    Dropdown,
    DropdownPosition,
    DropdownItem,
    KebabToggle
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { Remove2Icon, RepositoryIcon, ShareAltIcon, EditAltIcon } from '@patternfly/react-icons';

import AccountService, { HttpResponse } from '../../account-service/account.service';
import { PermissionRequest } from "./PermissionRequest";
import { ShareTheResource } from "./ShareTheResource";
import { Permission, Resource } from "./MyResourcesPage";
import { Msg } from '../../widgets/Msg';
import { ResourcesTableState, ResourcesTableProps, AbstractResourcesTable } from './AbstractResourceTable';
import { EditTheResource } from './EditTheResource';
import { ContentAlert } from '../ContentAlert';

export interface CollapsibleResourcesTableState extends ResourcesTableState {
    isRowOpen: boolean[];
    contextOpen: boolean[];
    isModalActive: boolean;
}

export class ResourcesTable extends AbstractResourcesTable<CollapsibleResourcesTableState> {

    public constructor(props: ResourcesTableProps) {
        super(props);
        this.state = {
            isRowOpen: [],
            contextOpen: [],
            isModalActive: false,
            permissions: new Map()
        }
    }

    private onToggle = (row: number): void => {
        const newIsRowOpen: boolean[] = this.state.isRowOpen;
        newIsRowOpen[row] = !newIsRowOpen[row];
        if (newIsRowOpen[row]) this.fetchPermissions(this.props.resources.data[row], row);
        this.setState({ isRowOpen: newIsRowOpen });
    };

    private onContextToggle = (row: number, isOpen: boolean): void => {
        if (this.state.isModalActive) return;
        const data = this.props.resources.data;
        const contextOpen = this.state.contextOpen;
        contextOpen[row] = isOpen;
        if (isOpen) {
            const index = row > data.length ? row - data.length - 1 : row;
            this.fetchPermissions(data[index], index);
        }
        this.setState({ contextOpen });
    }

    private fetchPermissions(resource: Resource, row: number): void {
        AccountService.doGet(`/resources/${resource._id}/permissions`)
            .then((response: HttpResponse<Permission[]>) => {
                const newPermissions: Map<number, Permission[]> = new Map(this.state.permissions);
                newPermissions.set(row, response.data || []);
                this.setState({ permissions: newPermissions });
            });
    }

    private removeShare(resource: Resource, row: number): Promise<void> {
        const permissions = this.state.permissions.get(row)!.map(a => ({ username: a.username, scopes: [] }));
        return AccountService.doPut(`/resources/${resource._id}/permissions`, permissions)
            .then(() => {
                ContentAlert.success(Msg.localize('unShareSuccess'));
            });
    }

    public render(): React.ReactNode {
        if (this.props.resources.data.length === 0) {
            return (
                <EmptyState variant={EmptyStateVariant.full}>
                    <EmptyStateIcon icon={RepositoryIcon} />
                    <Title headingLevel="h5" size="lg">
                        <Msg msgKey="notHaveAnyResource" />
                    </Title>
                </EmptyState>
            );
        }
        return (
            <DataList aria-label={Msg.localize('resources')} id="resourcesList">
                <DataListItem key='resource-header' aria-labelledby='resource-header'>
                    <DataListItemRow>
                        // invisible toggle allows headings to line up properly
                        <span style={{ visibility: 'hidden' }}>
                            <DataListToggle
                                isExpanded={false}
                                id='resource-header-invisible-toggle'
                                aria-controls="ex-expand1"
                            />
                        </span>
                        <DataListItemCells
                            dataListCells={[
                                <DataListCell key='resource-name-header' width={5}>
                                    <strong><Msg msgKey='resourceName' /></strong>
                                </DataListCell>,
                                <DataListCell key='application-name-header' width={5}>
                                    <strong><Msg msgKey='application' /></strong>
                                </DataListCell>,
                                <DataListCell key='permission-request-header' width={5}>
                                    <strong><Msg msgKey='permissionRequests' /></strong>
                                </DataListCell>,
                            ]}
                        />
                    </DataListItemRow>
                </DataListItem>
                {this.props.resources.data.map((resource: Resource, row: number) => (
                    <DataListItem key={'resource-' + row} aria-labelledby={resource.name} isExpanded={this.state.isRowOpen[row]}>
                        <DataListItemRow>
                            <DataListToggle
                                onClick={() => this.onToggle(row)}
                                isExpanded={this.state.isRowOpen[row]}
                                id={'resourceToggle-' + row}
                                aria-controls="ex-expand1"
                            />
                            <DataListItemCells
                                dataListCells={[
                                    <DataListCell key={'resourceName-' + row} width={5}>
                                        <Msg msgKey={resource.name} />
                                    </DataListCell>,
                                    <DataListCell key={'resourceClient-' + row} width={5}>
                                        <a href={resource.client.baseUrl}>{this.getClientName(resource.client)}</a>
                                    </DataListCell>,
                                    <DataListCell key={'permissionRequests-' + row} width={5}>
                                        {resource.shareRequests.length > 0 &&
                                            <PermissionRequest
                                                resource={resource}
                                                onClose={() => this.fetchPermissions(resource, row)}
                                            ></PermissionRequest>
                                        }
                                    </DataListCell>
                                ]}
                            />
                            <DataListAction
                                className={DataListActionVisibility.hiddenOnXl}
                                aria-labelledby="check-action-item3 check-action-action3"
                                id="check-action-action3"
                                aria-label="Actions"
                            >
                                <Dropdown
                                    isPlain
                                    position={DropdownPosition.right}
                                    onSelect={() => this.setState({ isModalActive: true })}
                                    toggle={<KebabToggle onToggle={isOpen => this.onContextToggle(row + this.props.resources.data.length + 1, isOpen)} />}
                                    isOpen={this.state.contextOpen[row + this.props.resources.data.length + 1]}
                                    dropdownItems={[
                                        <ShareTheResource
                                            resource={resource}
                                            permissions={this.state.permissions.get(row)!}
                                            sharedWithUsersMsg={this.sharedWithUsersMessage(row)}
                                            onClose={() => {
                                                this.setState({ isModalActive: false }, () => {
                                                    this.onContextToggle(row + this.props.resources.data.length + 1, false);
                                                });
                                            }}
                                        >
                                            {
                                                (toggle: () => void) => (
                                                    <DropdownItem id={'mob-share-' + row} key="mob-share" onClick={toggle}>
                                                        <ShareAltIcon /> Share
                                                    </DropdownItem>)
                                            }
                                        </ShareTheResource>,
                                        <EditTheResource
                                            resource={resource}
                                            permissions={this.state.permissions.get(row)!}
                                            onClose={() => {
                                                this.setState({ isModalActive: false }, () => {
                                                    this.onContextToggle(row + this.props.resources.data.length + 1, false);
                                                });
                                            }}
                                        >
                                            {
                                                (toggle: () => void) => (
                                                    <DropdownItem
                                                        id={'mob-edit-' + row} key="mob-edit"
                                                        isDisabled={this.numOthers(row) < 0}
                                                        onClick={toggle}
                                                    >
                                                        <EditAltIcon /> Edit
                                                    </DropdownItem>)
                                            }
                                        </EditTheResource>,
                                        <DropdownItem
                                            id={'mob-remove-' + row}
                                            key="mob-remove"
                                            isDisabled={this.numOthers(row) < 0}
                                            onClick={() => {
                                                this.removeShare(resource, row).then(() =>
                                                    this.setState({ isModalActive: false }, () => {
                                                        this.onContextToggle(row + this.props.resources.data.length + 1, false);
                                                    })
                                                );
                                            }}
                                        >
                                            <Remove2Icon /> Remove
                                        </DropdownItem>
                                    ]}
                                />
                            </DataListAction>
                            <DataListAction
                                className={css(DataListActionVisibility.visibleOnXl, DataListActionVisibility.hidden)}
                                aria-labelledby="check-action-item3 check-action-action3"
                                id="check-action-action3"
                                aria-label="Actions"
                            >
                                <ShareTheResource
                                    resource={resource}
                                    permissions={this.state.permissions.get(row)!}
                                    sharedWithUsersMsg={this.sharedWithUsersMessage(row)}
                                    onClose={() => this.fetchPermissions(resource, row)}
                                >
                                    {
                                        (toggle: () => void) => (
                                            <Button variant="link" onClick={toggle}>
                                                <ShareAltIcon /> Share
                                            </Button>
                                        )
                                    }
                                </ShareTheResource>
                                <Dropdown
                                    isPlain
                                    position={DropdownPosition.right}
                                    toggle={<KebabToggle onToggle={isOpen => this.onContextToggle(row, isOpen)} />}
                                    onSelect={() => this.setState({ isModalActive: true })}
                                    isOpen={this.state.contextOpen[row]}
                                    dropdownItems={[
                                        <EditTheResource
                                            resource={resource}
                                            permissions={this.state.permissions.get(row)!}
                                            onClose={() => {
                                                this.setState({ isModalActive: false }, () => {
                                                    this.onContextToggle(row, false);
                                                });
                                            }}
                                        >
                                            {
                                                (toggle: () => void) => (
                                                    <DropdownItem
                                                        id={'edit-' + row}
                                                        key="edit"
                                                        component="button"
                                                        isDisabled={this.numOthers(row) < 0}
                                                        onClick={toggle}
                                                    >
                                                        <EditAltIcon /> Edit
                                                    </DropdownItem>)
                                            }
                                        </EditTheResource>,
                                        <DropdownItem
                                            id={'remove-' + row}
                                            key="remove"
                                            component="button"
                                            isDisabled={this.numOthers(row) < 0}
                                            onClick={() => {
                                                this.removeShare(resource, row).then(() =>
                                                    this.setState({ isModalActive: false }, () => {
                                                        this.onContextToggle(row, false);
                                                    })
                                                );
                                            }}
                                        >
                                            <Remove2Icon /> Remove
                                        </DropdownItem>
                                    ]}
                                />
                            </DataListAction>

                        </DataListItemRow>
                        <DataListContent
                            noPadding={false}
                            aria-label="Session Details"
                            id={'ex-expand' + row}
                            isHidden={!this.state.isRowOpen[row]}
                        >
                            <Level gutter='md'>
                                <LevelItem><span /></LevelItem>
                                <LevelItem id={'shared-with-user-message-' + row}>{this.sharedWithUsersMessage(row)}</LevelItem>
                                <LevelItem><span /></LevelItem>
                            </Level>
                        </DataListContent>
                    </DataListItem>
                ))}
            </DataList>
        );
    }
}