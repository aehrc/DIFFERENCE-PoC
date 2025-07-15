import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cloneElement } from "react";
import { SidebarItem } from "@/utils/sidebarItem.ts";

interface SideBarItemProps {
  sidebarItem: SidebarItem;
  activePath: string;
  onSwitchActivePage: (newPath: string) => void;
}

function SideBarItem(props: SideBarItemProps) {
  const { sidebarItem, activePath, onSwitchActivePage } = props;
  const { title, path, Icon } = sidebarItem;

  const pathIsActive =
    path === "/" ? activePath === path : activePath.startsWith(path);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={() => onSwitchActivePage(path)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            pathIsActive ? "text-primary" : "text-muted-foreground hover:text-muted-foreground/60 cursor-pointer"
          } transition-colors   md:h-8 md:w-8`}
        >
          {cloneElement(Icon, { className: "h-5 w-5" })}
          <span className="sr-only">{title}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}

export default SideBarItem;
