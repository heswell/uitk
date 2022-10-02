import { StrictMode } from "react";
import * as ReactDOM from "react-dom";
import { ToolkitProvider } from "@heswell/uitk-core";

import "@heswell/uitk-theme/index.css";

import { App } from "./App";

ReactDOM.render(
  <StrictMode>
    <ToolkitProvider density="medium" theme="light">
      <App />
    </ToolkitProvider>
  </StrictMode>,
  document.getElementById("root")
);
