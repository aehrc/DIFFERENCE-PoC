function useValidateAuthorization() {
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get("error") ?? null;
  const error_description = queryParams.get("error_description") ?? null;

  return { authorizationError: error_description ?? error };
}

export default useValidateAuthorization;
