import { T, useTranslate } from "@tolgee/react";
import { SidebarItem } from "./SidebarItem";

type SubItem = {
  type: "page";
  label: string;
  path: string;
};

type RootItem =
  | {
      type: "page";
      label: string;
      path: string;
    }
  | {
      type: "group";
      label: string;
      children: SubItem[];
    };

const items: RootItem[] = [
  {
    type: "page",
    label: "navigation.home",
    path: "/",
  },
  {
    type: "group",
    label: "navigation.schedule",
    children: [
      {
        type: "page",
        label: "navigation.schedule.all_activities",
        path: "/schedule/activities.html",
      },
      {
        type: "page",
        label: "navigation.schedule.my_schedule",
        path: "/schedule/my.html",
      },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslate();

  return (
    <aside className="w-48 p-4 border-r">
      <h1 className="font-bold text-heading-xs mb-4">
        <T keyName="sidebar.header" />
      </h1>

      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          if (item.type === "page") {
            return (
              <SidebarItem
                key={item.path}
                to={item.path}
                labelKey={item.label}
              />
            );
          } else if (item.type === "group") {
            return (
              <div key={item.label} className="mt-3">
                <p className="text-sm font-semibold px-3">
                  <T keyName={item.label} ns="sidebar" />
                </p>
                <ul className="flex flex-col gap-1">
                  {item.children.map((subItem) => (
                    <SidebarItem
                      key={subItem.path}
                      to={subItem.path}
                      labelKey={subItem.label}
                    />
                  ))}
                </ul>
              </div>
            );
          }

          return null;
        })}
      </ul>
    </aside>
  );
}
