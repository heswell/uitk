import { CSSProperties, FC, useMemo, useRef } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import { ListItemNext as ListItem, ListItemProps } from "../../list-next";
import { QueryInputCategory } from "../queryInputTypes";
import { useCategoryListContext } from "./CategoryListContext";

const withBaseName = makePrefixer("uitkCategoryListItem");

export interface CategoryListItemProps
  extends ListItemProps<QueryInputCategory> {
  category: QueryInputCategory;
}

export const CategoryListItem: FC<CategoryListItemProps> =
  function CategoryListItem({ item: category, ...props }) {
    const textRef = useRef<HTMLDivElement>(null);
    const context = useCategoryListContext();

    const textStyle: CSSProperties = useMemo(
      () => ({
        minWidth: context.width,
      }),
      [context.width]
    );

    return (
      <ListItem {...props} label={category?.name}>
        <div ref={textRef} className={withBaseName("text")} style={textStyle}>
          {category?.name}
        </div>
        <div className={withBaseName("valuesContainer")}>
          <span>(</span>
          <span className={withBaseName("values")}>
            {category?.values.join(", ")}
          </span>
          <span>)</span>
        </div>
        <ChevronRightIcon className={withBaseName("chevron")} />
      </ListItem>
    );
  };
