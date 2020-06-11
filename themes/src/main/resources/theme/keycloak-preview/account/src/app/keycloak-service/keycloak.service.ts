/*
 * Copyright 2017 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {KeycloakLoginOptions} from "../../../../../../../../../../adapters/oidc/js/src/main/resources/keycloak";

declare const baseUrl: string;
export type KeycloakClient = Keycloak.KeycloakInstance;

export class KeycloakService {
    private keycloakAuth: KeycloakClient;

    public constructor(keycloak: KeycloakClient) {
        this.keycloakAuth = keycloak;
        this.keycloakAuth.onTokenExpired = () => this.getToken(true).catch(() => this.logout());
        this.keycloakAuth.onAuthRefreshError = () => this.logout();
    }

    public authenticated(): boolean {
        return this.keycloakAuth.authenticated ? this.keycloakAuth.authenticated : false;
    }

    public login(options?: KeycloakLoginOptions): void {
        this.keycloakAuth.login(options);
    }

    public logout(redirectUri: string = baseUrl): void {
        this.keycloakAuth.logout({redirectUri: redirectUri});
    }

    public account(): void {
        this.keycloakAuth.accountManagement();
    }

    public authServerUrl(): string | undefined {
        const authServerUrl = this.keycloakAuth.authServerUrl;
        return authServerUrl!.charAt(authServerUrl!.length - 1) === '/' ? authServerUrl : authServerUrl + '/';
    }

    public realm(): string | undefined {
        return this.keycloakAuth.realm;
    }

    public getToken(force: boolean = false): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.keycloakAuth.token) {
                this.keycloakAuth
                    .updateToken(force ? -1 : 5)
                    .success(() => {
                        resolve(this.keycloakAuth.token as string);
                    })
                    .error(() => {
                        reject('Failed to refresh token');
                    });
            } else {
                reject('Not logged in');
            }
        });
    }
}