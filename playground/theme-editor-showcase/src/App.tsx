/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { ThemeEditorApp } from "@heswell/theme-editor-app/src/ThemeEditorApp";
import { ElectronWindow } from "@heswell/uitk-lab/src/window";
import { WindowContext } from "@heswell/uitk-core/src/window";
import { isDesktop } from "@heswell/uitk-core";

import { CSSByPattern } from "@heswell/theme-editor";

import "./App.css";

export const App = () => {
  const [cssByPattern, setCSSByPattern] = useState<CSSByPattern[]>([]);

  useEffect(() => {
    if (isDesktop) {
      let cssString = "";
      cssByPattern?.forEach((element) => {
        cssString += element.cssObj;
      });
      // eslint-disable-next-line
      (window as any).ipcRenderer.send(
        "update-styles",
        `"${cssString.replaceAll("\n", "")}"`
      );
    }
  }, [cssByPattern]);

  const saveCSS = () => {
    if (isDesktop) {
      // eslint-disable-next-line
      (window as any).ipcRenderer.send("save-styles", cssByPattern);
    }
  };

  return (
    <WindowContext.Provider value={ElectronWindow}>
      <BrowserRouter>
        <ThemeEditorApp
          sendCSStoElectron={(cssByPattern: CSSByPattern[]) =>
            setCSSByPattern(cssByPattern)
          }
          saveCSSInElectron={saveCSS}
        />
      </BrowserRouter>
    </WindowContext.Provider>
  );
};
