import { createContext, ReactNode, useState } from "react";
import { IsValidIdToken, TokenResponse } from "@/utils/oauth.ts";
import { getFhirServerBaseUrl, getSecondaryFhirServerBaseUrl } from "@/utils/misc.ts";
import { jwtDecode } from "jwt-decode";

interface FhirServerContextType {
  baseUrl: string;
  tokenEndpoint: string;
  tokenResponse: TokenResponse | null;
  accessToken: string;
  refreshToken: string;
  fhirUser: string | null;
  setTokenEndpoint: (token_endpoint: string) => void;
  setTokenResponse: (accessTokenResponse: TokenResponse | null) => void;
}

export const FhirServerContext = createContext<Record<string, FhirServerContextType>>({});

const FhirServerContextProvider = (props: { children: ReactNode }) => {
  const { children } = props;

  const [tokenEndpoints, setTokenEndpoints] = useState<Record<string, string | null>>({});
  const [tokenResponses, setTokenResponses] = useState<Record<string, TokenResponse | null>>(
    retrieveStoredTokenResponse()
  );
  const [fhirUsers, setFhirUsers] = useState<Record<string, string | null>>({});

  const contextValue: Record<string, FhirServerContextType> = {}
  const createContextValue = (baseUrl: string): FhirServerContextType => ({
    baseUrl,
    tokenEndpoint: tokenEndpoints[baseUrl] ?? "",
    tokenResponse: tokenResponses[baseUrl],
    accessToken: tokenResponses[baseUrl]?.access_token ?? "",
    refreshToken: tokenResponses[baseUrl]?.refresh_token ?? "",
    fhirUser: fhirUsers[baseUrl],
    setTokenEndpoint: (token_endpoint) => setTokenEndpoints(prevState => {
      const endpoints = {...prevState};
      endpoints[baseUrl] = token_endpoint;
      return endpoints;
    }),
    setTokenResponse: (accessTokenResponse) => {
      setTokenResponses(prevState => {
        const responses = {...prevState};
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
      setFhirUsers(prevState => {
        const users = {...prevState};
        users[baseUrl] = user;
        return users;
      });
    },
  })

  contextValue[getFhirServerBaseUrl()] = createContextValue(getFhirServerBaseUrl());
  if (getSecondaryFhirServerBaseUrl()) {
    contextValue[getSecondaryFhirServerBaseUrl()] = createContextValue(getSecondaryFhirServerBaseUrl());
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
