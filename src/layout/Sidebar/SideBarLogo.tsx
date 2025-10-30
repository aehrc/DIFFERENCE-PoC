import { cloneElement } from "react";
import { SidebarItem } from "@/utils/sidebarItem.ts";

interface SideBarLogoProps {
  sidebarItem: SidebarItem;
  onSwitchActivePage: (newPath: string) => void;
}

function SideBarLogo(props: SideBarLogoProps) {
  const { sidebarItem, onSwitchActivePage } = props;
  const { title, path, Icon } = sidebarItem;

  return (
    <a
      href="#"
      onClick={() => onSwitchActivePage(path)}
      className={`group flex h-12 w-12 items-center justify-center text-lg`}
    >
      {cloneElement(Icon, {
        className: "transition-all group-hover:scale-110 text-primary",
      })}
      <span className="sr-only">{title}</span>
    </a>
  );
}

export default SideBarLogo;
