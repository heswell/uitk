import { DecoratorFn } from "@storybook/react";
import {
  getCharacteristicValue,
  ModeValues,
  Panel,
  ToolkitProvider,
  useTheme,
} from "@heswell/uitk-core";
import { useEffect } from "react";

// Modified from storybook background addon
// https://github.com/storybookjs/storybook/blob/next/addons/backgrounds/src/helpers/index.ts
export const addBackgroundStyle = (selector: string, css: string) => {
  const existingStyle = document.getElementById(selector);
  if (existingStyle) {
    if (existingStyle.innerHTML !== css) {
      existingStyle.innerHTML = css;
    }
  } else {
    const style = document.createElement("style");
    style.setAttribute("id", selector);
    style.innerHTML = css;

    document.head.appendChild(style);
  }
};

function SetBackground({ viewMode, id }: { viewMode: string; id: string }) {
  const { theme, mode } = useTheme();
  const selectorId =
    viewMode === "docs"
      ? `addon-backgrounds-docs-${id}`
      : `addon-backgrounds-color`;

  const selector = viewMode === "docs" ? `.docs-story` : ".sb-show-main";

  useEffect(() => {
    const color = getCharacteristicValue(theme, "text", "primary-foreground");
    const background = getCharacteristicValue(
      theme,
      "container",
      "background-medium"
    );

    addBackgroundStyle(
      selectorId,
      `
        ${selector} {
          background: ${background || "unset"};
          color: ${color || "unset"};
          transition: background-color 0.3s;
        }
      `
    );
  }, [selectorId, selector, mode, theme]);

  return null;
}

export const withTheme: DecoratorFn = (StoryFn, context) => {
  const { density, mode } = context.globals;

  if (mode === "side-by-side" || mode === "stacked") {
    const isStacked = mode === "stacked";

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isStacked
            ? "1fr"
            : "repeat(auto-fit, minmax(0px, 1fr))",
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {ModeValues.map((mode) => (
          <ToolkitProvider
            applyClassesTo={"child"}
            density={density}
            mode={mode}
            key={mode}
          >
            <Panel>
              <StoryFn />
            </Panel>
          </ToolkitProvider>
        ))}
      </div>
    );
  }

  return (
    <ToolkitProvider density={density} mode={mode}>
      <SetBackground viewMode={context.viewMode} id={context.id} />
      <StoryFn />
    </ToolkitProvider>
  );
};
