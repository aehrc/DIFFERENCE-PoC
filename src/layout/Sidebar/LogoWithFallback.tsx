import { useState } from "react";

interface LogoWithFallbackProps {
  src: string | null;
  fallback: React.ReactNode;
}

function LogoWithFallback({
  src,
  fallback,
}: LogoWithFallbackProps): JSX.Element {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <>{fallback}</>;
  }

  return <img src={src} onError={() => setError(true)} alt="" />;
}

export default LogoWithFallback;
