import { HTMLAttributes, memo } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { CheckboxBase } from "../checkbox";
import { ComponentType } from "./listTypes";
import { Highlighter } from "./Highlighter";

import "./ListItemNext.css";

const withBaseName = makePrefixer("uitkListItemNext");
export interface ListItemProps<T = unknown>
  extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  disabled?: boolean;
  item?: T;
  itemHeight?: number | string;
  itemTextHighlightPattern?: RegExp | string;
  label?: string;
  showCheckbox?: boolean;
  /**
   * selectable is a marker, used by List, not used by ListItem itself
   */
  selectable?: boolean;
  selected?: boolean;
}

// Note: the memo is effective if List label is passed as simple string
// If children are used, it is the responsibility of caller to memoise
// these if performance on highlight is perceived to be an issue.
export const ListItemNext = memo(
  ({
    children,
    className: classNameProp,
    disabled,
    tabIndex,
    itemHeight,
    itemTextHighlightPattern,
    label,
    selectable: _notUsed,
    selected,
    showCheckbox,
    style: styleProp,
    ...props
  }: ListItemProps) => {
    const className = cx(withBaseName(), classNameProp, {
      [withBaseName("disabled")]: disabled,
      [withBaseName("checkbox")]: showCheckbox,
    });
    const style =
      itemHeight !== undefined
        ? {
            ...styleProp,
            height: itemHeight,
          }
        : styleProp;

    return (
      <div
        className={className}
        {...props}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        style={style}
      >
        {showCheckbox && (
          <CheckboxBase
            aria-hidden
            checked={selected}
            inputProps={{
              tabIndex: -1,
            }}
          />
        )}
        {children && typeof children !== "string" ? (
          children
        ) : itemTextHighlightPattern == null ? (
          <span className={withBaseName("textWrapper")}>
            {label || children}
          </span>
        ) : (
          <Highlighter
            matchPattern={itemTextHighlightPattern}
            text={label || (children as string)}
          />
        )}
      </div>
    );
  }
) as ComponentType<ListItemProps>;
