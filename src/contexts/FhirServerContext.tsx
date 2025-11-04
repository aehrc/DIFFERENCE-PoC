/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createContext, ReactNode, useState } from "react";
import { IsValidIdToken, TokenResponse } from "@/utils/oauth.ts";
import { jwtDecode } from "jwt-decode";
import useConfig from "@/hooks/useConfig";

interface FhirServerContextType {
  baseUrl: string;
  authRequired: boolean;
  tokenEndpoint: string;
  tokenResponse: TokenResponse | null;
  accessToken: string;
  refreshToken: string;
  fhirUser: string | null;
  setTokenEndpoint: (token_endpoint: string) => void;
  setTokenResponse: (accessTokenResponse: TokenResponse | null) => void;
}

export const FhirServerContext = createContext<
  Record<string, FhirServerContextType>
>({});

const FhirServerContextProvider = (props: { children: ReactNode }) => {
  const { children } = props;

  const [tokenEndpoints, setTokenEndpoints] = useState<
    Record<string, string | null>
  >({});
  const [tokenResponses, setTokenResponses] = useState<
    Record<string, TokenResponse | null>
  >(retrieveStoredTokenResponse());
  const [fhirUsers, setFhirUsers] = useState<Record<string, string | null>>({});

  const contextValue: Record<string, FhirServerContextType> = {};
  const createContextValue = (
    baseUrl: string,
    authRequired: boolean
  ): FhirServerContextType => ({
    baseUrl,
    authRequired,
    tokenEndpoint: tokenEndpoints[baseUrl] ?? "",
    tokenResponse: tokenResponses[baseUrl],
    accessToken: tokenResponses[baseUrl]?.access_token ?? "",
    refreshToken: tokenResponses[baseUrl]?.refresh_token ?? "",
    fhirUser: fhirUsers[baseUrl],
    setTokenEndpoint: (token_endpoint) =>
      setTokenEndpoints((prevState) => {
        const endpoints = { ...prevState };
        endpoints[baseUrl] = token_endpoint;
        return endpoints;
      }),
    setTokenResponse: (accessTokenResponse) => {
      setTokenResponses((prevState) => {
        const responses = { ...prevState };
        responses[baseUrl] = accessTokenResponse;
        return responses;
      });

      // Store in session storage
      const stateKeysStr = sessionStorage.getItem("state");
      if (stateKeysStr) {
        const stateKeys = JSON.parse(stateKeysStr);
        const state = stateKeys[baseUrl];
        if (state) {
          sessionStorage.setItem(state, JSON.stringify(accessTokenResponse));
        }
      }

      let user = null;
      if (accessTokenResponse) {
        const decodedIdToken = jwtDecode(accessTokenResponse.id_token);
        if (IsValidIdToken(decodedIdToken)) {
          user = getResourceIdentifier(decodedIdToken.fhirUser);
        }
      }
      setFhirUsers((prevState) => {
        const users = { ...prevState };
        users[baseUrl] = user;
        return users;
      });
    },
  });

  const { fhirServerUrl, authRequired, secondaryFhirServer } = useConfig();

  contextValue[fhirServerUrl] = createContextValue(fhirServerUrl, authRequired);
  if (secondaryFhirServer) {
    const {
      fhirServerUrl: secondaryFhirServerUrl,
      authRequired: secondaryAuthRequired,
    } = secondaryFhirServer;
    contextValue[secondaryFhirServerUrl] = createContextValue(
      secondaryFhirServerUrl,
      secondaryAuthRequired
    );
  }

  return (
    <FhirServerContext.Provider value={contextValue}>
      {children}
    </FhirServerContext.Provider>
  );
};

function getResourceIdentifier(url: string) {
  const parts = url.split("/");
  if (parts.length >= 2) {
    const lastTwoParts = parts.slice(-2); // Get the last two segments
    return lastTwoParts.join("/"); // Join them back together
  }

  return null; // Return null or handle the case where the URL is not as expected
}

function retrieveStoredTokenResponse() {
  const tokenResponses: Record<string, TokenResponse> = {};
  const stateKeysStr = sessionStorage.getItem("state");
  if (stateKeysStr) {
    const stateKeys = JSON.parse(stateKeysStr);
    for (let baseUrl of Object.keys(stateKeys)) {
      const responseStr = sessionStorage.getItem(stateKeys[baseUrl]);
      if (responseStr) {
        tokenResponses[baseUrl] = JSON.parse(responseStr);
      }
    }
  }
  return tokenResponses;
}

export default FhirServerContextProvider;
