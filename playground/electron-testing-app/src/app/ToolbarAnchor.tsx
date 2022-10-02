import { RefAttributes } from "react";
import { IconProps, MoveAllIcon } from "@heswell/uitk-icons";

export const ToolbarAnchor = (
  props: JSX.IntrinsicAttributes & IconProps & RefAttributes<HTMLSpanElement>
) => {
  return (
    <MoveAllIcon
      {...props}
      style={{
        // @ts-ignore
        "-webkit-app-region": "drag",
      }}
    />
  );
};
