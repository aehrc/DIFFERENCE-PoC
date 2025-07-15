import { ReactNode } from "react";

interface HeaderProps {
  children: ReactNode;
}

function Header(props: HeaderProps) {
  const { children } = props;
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 py-1.5 border-b px-4 sm:static sm:h-auto sm:border-0 sm:px-6 bg-[url(@/img/bioc-banner.svg)] bg-[length:auto_100%]">
      {children}
    </header>
  );
}

export default Header;
