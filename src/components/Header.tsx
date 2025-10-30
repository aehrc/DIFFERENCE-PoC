import { ReactNode } from "react";
import { BRANDING } from "@/globals";

interface HeaderProps {
  children: ReactNode;
}

function Header(props: HeaderProps) {
  const { children } = props;
  const { bannerUrl } = BRANDING;
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-4 py-1.5 border-b px-4 sm:static sm:h-auto sm:border-0 sm:px-6 bg-[length:auto_100%]"
      style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined }}
    >
      {children}
    </header>
  );
}

export default Header;
