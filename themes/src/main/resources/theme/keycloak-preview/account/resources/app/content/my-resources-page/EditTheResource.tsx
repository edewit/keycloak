/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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
    Button,
    Modal,
    DataList,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListItem
} from '@patternfly/react-core';

import { Resource, Permission, Scope } from './MyResourcesPage';
import { Msg } from '../../widgets/Msg';
import AccountService, {HttpResponse} from '../../account-service/account.service';
import { ContentAlert } from '../ContentAlert';
import { PermissionSelect } from './PermissionSelect';

interface EditTheResourceProps {
    resource: Resource;
    permissions: Permission[];
    onClose: () => void;
    children: (toggle: () => void) => void;
}

interface EditTheResourceState {
    isOpen: boolean;
}

export class EditTheResource extends React.Component<EditTheResourceProps, EditTheResourceState> {
    protected static defaultProps = { permissions: [], row: 0 };

    public constructor(props: EditTheResourceProps) {
        super(props);

        this.state = {
            isOpen: false,
        };
    }

    private clearState(): void {
        this.setState({});
    }

    private handleToggleDialog = () => {
        if (this.state.isOpen) {
            this.setState({ isOpen: false });
            this.props.onClose();
        } else {
            this.clearState();
            this.setState({ isOpen: true });
        }
    };

    async deletePermission(permission: Permission, scope: Scope): Promise<void> {
        permission.scopes.splice(permission.scopes.indexOf(scope), 1);
        await AccountService.doPut(`/resources/${this.props.resource._id}/permissions`, [permission]);
        ContentAlert.success(Msg.localize('shareSuccess'));
        this.props.onClose();
    }

    public render(): React.ReactNode {
        return (
            <React.Fragment>
                {this.props.children(this.handleToggleDialog)}

                <Modal
                    title={'Edit the resource - ' + this.props.resource.name}
                    isLarge={true}
                    isOpen={this.state.isOpen}
                    onClose={this.handleToggleDialog}
                    actions={[
                        <Button key="done" variant="link" id="done" onClick={this.handleToggleDialog}>
                            <Msg msgKey='done' />
                        </Button>,
                    ]}
                >
                    <DataList aria-label={Msg.localize('resources')}>
                        <DataListItemRow>
                            <DataListItemCells
                                dataListCells={[
                                    <DataListCell key='resource-name-header' width={3}>
                                        <strong><Msg msgKey='User' /></strong>
                                    </DataListCell>,
                                    <DataListCell key='permissions-header' width={5}>
                                        <strong><Msg msgKey='permissions' /></strong>
                                    </DataListCell>,
                                ]}
                            />
                        </DataListItemRow>
                        {this.props.permissions.map((p, row) => {
                            return (
                                <DataListItem key={'resource-' + row} aria-labelledby={p.username}>
                                    <DataListItemRow>
                                        <DataListItemCells
                                            dataListCells={[
                                                <DataListCell key={'userName-' + row} width={5}>
                                                    {p.username}
                                                </DataListCell>,
                                                <DataListCell key={'permission-' + row} width={5}>
                                                    <PermissionSelect
                                                        scopes={p.scopes}
                                                        onSelect={selection => console.log(selection)}
                                                    />
                                                </DataListCell>
                                            ]}
                                        />
                                    </DataListItemRow>
                                </DataListItem>
                            );
                        })}
                    </DataList>
                </Modal>
            </React.Fragment>
        );
    }
}