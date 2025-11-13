import { Link } from "@tanstack/react-router";
import { T } from "@tolgee/react";

export type Props = {
  to: string;
  labelKey: string;
};

export function SidebarItem({ to, labelKey }: Props) {
  return (
    <li>
      <Link
        to={to}
        className={`
          border-l-4
          border-transparent
          flex justify-start items-center px-2
          h-8
          rounded
          [&.active]:bg-slate-200
          [&.active]:border-blue-500
        `}
      >
        <T keyName={labelKey} ns="sidebar" />
      </Link>
    </li>
  );
}
