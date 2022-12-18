import { useState } from "react";
import { AdjustableFlexbox as Flexbox } from "../components";
import {
  AppHeader,
  Badge,
  Logo,
  LogoProps,
  Tab,
  Tabstrip,
  TabstripProps,
  Tooltray /*, Toolbar */,
} from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import {
  FilterIcon,
  MessageIcon,
  SearchIcon,
  UserGroupIcon,
  UserIcon,
} from "@salt-ds/icons";

import PlaceholderLogo from "docs/assets/placeholder.svg";

import "docs/story.css";
import "./Flexbox.css";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/App Header",
  component: AppHeader,
} as ComponentMeta<typeof AppHeader>;

// const ToolbarButton = ({ iconName, ...props }) => (
//   <Button variant="secondary" tabIndex={0} {...props}>
//     <Icon name={iconName} />
//   </Button>
// );

const colours = [
  "yellow",
  "red",
  "cornflowerblue",
  "brown",
  "green",
  "purple",
  "orange",
  "lime",
  "silver",
  "maroon",
];

const useTabSelection = (): [number, TabstripProps["onActiveChange"]] => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

type ResponsiveItem = { "data-collapsed"?: boolean };

const CollapsibleLogo = (props: LogoProps & ResponsiveItem) => (
  <Logo {...props} compact={props["data-collapsed"]} />
);

export const Default: ComponentStory<typeof AppHeader> = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const tabs = ["Home", "Transactions", "FX", "Checks", "Loans"];
  return (
    <Flexbox width={1000} height={400}>
      <AppHeader>
        <CollapsibleLogo
          data-align-start
          data-collapsible="instant"
          data-idx={0}
          data-priority={1}
          src={PlaceholderLogo as string}
          appTitle="Salt"
        />
        <Tabstrip
          data-idx={1}
          data-priority={2}
          onActiveChange={handleTabSelection}
        >
          {tabs.map((label, i) => (
            <Tab label={label} key={i} />
          ))}
        </Tabstrip>
        <Tooltray
          data-collapsible="dynamic"
          data-idx={2}
          data-priority={1}
          data-align-end
          data-reclaim-space
        >
          <Button variant="secondary">
            <Badge badgeContent={50}>
              <MessageIcon />
            </Badge>
          </Button>
          <Button variant="secondary">
            <SearchIcon />
          </Button>
          <Button variant="secondary">
            <FilterIcon />
          </Button>
          <Button variant="secondary">
            <UserIcon />
          </Button>
          <Button variant="secondary">
            <UserGroupIcon />
          </Button>
        </Tooltray>
      </AppHeader>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};
