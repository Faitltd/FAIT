/**
 * Grid Component
 * 
 * A grid component for layout.
 */

import React, { forwardRef } from 'react';
import {
  BaseComponentProps,
  WithChildrenProps,
  PaddingProps,
  MarginProps,
  GridProps as GridStyleProps
} from '../../types';
import { composeClasses, composeStyles } from '../../utils';

export interface GridProps extends 
  BaseComponentProps,
  WithChildrenProps,
  PaddingProps,
  MarginProps,
  GridStyleProps {
  /** Grid tag */
  as?: keyof JSX.IntrinsicElements;
  /** Number of columns */
  columns?: number | string;
  /** Gap between grid items */
  gap?: number | string;
  /** Row gap between grid items */
  rowGap?: number | string;
  /** Column gap between grid items */
  columnGap?: number | string;
}

/**
 * Grid component
 * 
 * @example
 * ```tsx
 * <Grid columns={3} gap="1rem">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 * ```
 */
export const Grid = forwardRef<HTMLElement, GridProps>(({
  className,
  style,
  children,
  as: Component = 'div',
  columns,
  gap,
  rowGap,
  columnGap,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  gridTemplateColumns,
  gridTemplateRows,
  gridTemplateAreas,
  gridColumnGap,
  gridRowGap,
  gridGap,
  gridAutoColumns,
  gridAutoRows,
  gridAutoFlow,
  ...props
}, ref) => {
  // Determine grid template columns
  const templateColumns = gridTemplateColumns || (columns && (
    typeof columns === 'number'
      ? `repeat(${columns}, 1fr)`
      : columns
  ));
  
  // Determine grid gaps
  const finalGridGap = gridGap || gap;
  const finalGridRowGap = gridRowGap || rowGap;
  const finalGridColumnGap = gridColumnGap || columnGap;
  
  // Compose grid classes
  const gridClasses = composeClasses(
    'grid',
    className
  );
  
  // Compose grid styles
  const gridStyles = composeStyles(
    style,
    {
      display: 'grid',
      gridTemplateColumns: templateColumns,
      gridTemplateRows,
      gridTemplateAreas,
      gap: finalGridGap,
      rowGap: finalGridRowGap,
      columnGap: finalGridColumnGap,
      gridAutoColumns,
      gridAutoRows,
      gridAutoFlow,
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
    }
  );

  return (
    <Component
      ref={ref as any}
      className={gridClasses}
      style={gridStyles}
      {...props}
    >
      {children}
    </Component>
  );
});

Grid.displayName = 'Grid';

export default Grid;
