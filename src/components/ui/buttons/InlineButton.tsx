import React from 'react';
import Button, { ButtonProps } from '../Button';

const InlineButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => {
    return <Button variant="link" ref={ref} {...props} />;
  }
);

InlineButton.displayName = 'InlineButton';

export default InlineButton;
