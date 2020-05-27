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

import parse from '../../util/ParseLink';

import { Level, LevelItem, Stack, StackItem, Tab, Tabs, TextInput, Pagination, PaginationVariant } from '@patternfly/react-core';

import AccountService, {HttpResponse} from '../../account-service/account.service';

import {ResourcesTable} from './ResourcesTable';
import {ContentPage} from '../ContentPage';
import {Msg} from '../../widgets/Msg';
import { SharedResourcesTable } from './SharedResourcesTable';

export interface MyResourcesPageProps {
}

export interface MyResourcesPageState {
    activeTabKey: number;
    isModalOpen: boolean;
    nameFilter: string;
    myResources: PaginatedResources;
    sharedWithMe: PaginatedResources;
    currentPage: number;
    max: number;
}

export interface Resource {
    _id: string;
    name: string;
    client: Client;
    scopes: Scope[];
    uris: string[];
    shareRequests: Permission[];
}

export interface Client {
    baseUrl: string;
    clientId: string;
    name?: string;
}

export class Scope {
    public constructor(public name: string, public displayName?: string) {}

    public toString(): string {
        if (this.hasOwnProperty('displayName') && (this.displayName)) {
            return this.displayName;
        } else {
            return this.name;
        }
    }
}

export interface PaginatedResources {
    nextUrl: string;
    prevUrl: string;
    data: Resource[];
}

export interface Permission {
    email?: string;
    firstName?: string;
    lastName?: string;
    scopes: Scope[];  // this should be Scope[] - fix API
    username: string;
}

const MY_RESOURCES_TAB = 0;
const SHARED_WITH_ME_TAB = 1;

export class MyResourcesPage extends React.Component<MyResourcesPageProps, MyResourcesPageState> {
    private first = 0;

    public constructor(props: MyResourcesPageProps) {
        super(props);
        this.state = {
            activeTabKey: MY_RESOURCES_TAB,
            nameFilter: '',
            isModalOpen: false,
            myResources: {nextUrl: '', prevUrl: '', data: []},
            sharedWithMe: {nextUrl: '', prevUrl: '', data: []},
            currentPage: 1,
            max: 5
        };

        this.fetchInitialResources();
    }

    private isSharedWithMeTab(): boolean {
        return this.state.activeTabKey === SHARED_WITH_ME_TAB;
    }

    private hasNext(): boolean {
        if (this.isSharedWithMeTab()) {
            return (this.state.sharedWithMe.nextUrl !== null) && (this.state.sharedWithMe.nextUrl !== '');
        } else {
            return (this.state.myResources.nextUrl !== null) && (this.state.myResources.nextUrl !== '');
        }
    }

    private fetchInitialResources(): void {
        if (this.isSharedWithMeTab()) {
            this.fetchResources("/resources/shared-with-me");
        } else {
            this.fetchResources("/resources", {first: this.first, max: this.state.max});
        }
    }

    private fetchFilteredResources(params: Record<string, string|number>): void {
        if (this.isSharedWithMeTab()) {
            this.fetchResources("/resources/shared-with-me", params);
        } else {
            this.fetchResources("/resources", {...params, first: this.first, max: this.state.max});
        }
    }

    private fetchResources(url: string, extraParams?: Record<string, string|number>): void {
        AccountService.doGet<Resource[]>(url, {params: extraParams})
            .then((response: HttpResponse<Resource[]>) => {
                const resources: Resource[] = response.data || [];
                resources.forEach((resource: Resource) => resource.shareRequests = []);

                // serialize the Scope objects from JSON so that toString() will work.
                resources.forEach((resource: Resource) => resource.scopes = resource.scopes.map(this.makeScopeObj));

                if (this.isSharedWithMeTab()) {
                    this.setState({sharedWithMe: this.parseResourceResponse(response)}, this.fetchPending);
                } else {
                    this.setState({myResources: this.parseResourceResponse(response)}, this.fetchPermissionRequests);
                }
            });
    }

    private makeScopeObj = (scope: Scope): Scope => {
        return new Scope(scope.name, scope.displayName);
    }

    private fetchPermissionRequests = () => {
        this.state.myResources.data.forEach((resource: Resource) => {
            this.fetchShareRequests(resource);
        });
    }

    private fetchShareRequests(resource: Resource): void {
        AccountService.doGet('/resources/' + resource._id + '/permissions/requests')
            .then((response: HttpResponse<Permission[]>) => {
                resource.shareRequests = response.data || [];
                if (resource.shareRequests.length > 0) {
                    this.forceUpdate();
                }
            });
    }

    private fetchPending = async () => {
        const response: HttpResponse<Resource[]> = await AccountService.doGet(`/resources/pending-requests`);
        const resources: Resource[] = response.data || [];
        resources.forEach((pendingRequest: Resource) => {
            this.state.sharedWithMe.data.forEach(resource => {
                if (resource._id === pendingRequest._id) {
                    resource.shareRequests = [{username: 'me', scopes: pendingRequest.scopes}]
                    this.forceUpdate();
                }
            });
        });
    }

    private parseResourceResponse(response: HttpResponse<Resource[]>): PaginatedResources {
        const links: string | undefined = response.headers.get('link') || undefined;
        const parsed = parse(links);

        let next = '';
        let prev = '';

        if (parsed !== null) {
            if (parsed.next) next = parsed.next;
            if (parsed.prev) prev = parsed.prev;
        }

        const resources: Resource[] = response.data || [];

        return {nextUrl: next, prevUrl: prev, data: resources};
    }

    private makeTab(eventKey: number, title: string, resources: PaginatedResources, sharedResourcesTab: boolean): React.ReactNode {
        return (
            <Tab eventKey={eventKey} title={Msg.localize(title)}>
                <Stack gutter="md">
                    <StackItem isFilled><span/></StackItem>
                    <StackItem isFilled>
                        <Level gutter='md'>
                            <LevelItem>
                                <TextInput value={this.state.nameFilter} onChange={this.handleFilterRequest} id={'filter-' + title} type="text" placeholder={Msg.localize('filterByName')} />
                            </LevelItem>
                        </Level>
                    </StackItem>
                    <StackItem isFilled>
                        {!sharedResourcesTab && <ResourcesTable resources={resources}/>}
                        {sharedResourcesTab && <SharedResourcesTable resources={resources}/>}
                    </StackItem>
                </Stack>
            </Tab>
        )
    }

    public render(): React.ReactNode {
        return (
            <ContentPage title="resources" onRefresh={this.fetchInitialResources.bind(this)}>
                <Tabs isFilled activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
                    {this.makeTab(0, 'myResources', this.state.myResources, false)}
                    {this.makeTab(1, 'sharedwithMe', this.state.sharedWithMe, true)}
                </Tabs>

                <Pagination
                    itemCount={this.state.myResources.data.length + (this.hasNext() ? this.state.max : 0) + ((this.state.currentPage - 1) * this.state.max)}
                    widgetId="pagination-options"
                    perPage={this.state.max}
                    page={this.state.currentPage}
                    variant={PaginationVariant.bottom}
                    onSetPage={this.onSetPage}
                    onPerPageSelect={this.onPerPageSelect}
                    perPageOptions={[ { title: '5', value: 5 }, { title: '10', value: 10 }, { title: '20', value: 20 } ]}
                    isCompact
                />
            </ContentPage>
        );
    }

    private handleFilterRequest = (value: string) => {
        this.setState({nameFilter: value});
        this.fetchFilteredResources({name: value});
    }

    private handleNextClick = () => {
        if (this.isSharedWithMeTab()) {
            this.fetchResources(this.state.sharedWithMe.nextUrl);
        } else {
            this.fetchResources(this.state.myResources.nextUrl);
        }
    }

    private onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, pageNumber: number): void => {
        if (pageNumber > this.state.currentPage) {
            this.handleNextClick();
        } else {
            this.handlePreviousClick();
        }
        this.setState({currentPage: pageNumber});
    }

    private onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, perPage: number): void => {
        this.setState({max: perPage}, () => this.fetchInitialResources());
    }

    private handlePreviousClick = () => {
        if (this.isSharedWithMeTab()) {
            this.fetchResources(this.state.sharedWithMe.prevUrl);
        } else {
            this.fetchResources(this.state.myResources.prevUrl);
        }
    }

    private handleTabClick = (_event: React.MouseEvent<HTMLInputElement>, tabIndex: number) => {
        if (this.state.activeTabKey === tabIndex) return;

        this.setState({
            nameFilter: '',
            activeTabKey: tabIndex
        }, () => {this.fetchInitialResources()});
    };
};
