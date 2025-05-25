import React from 'react';
import Button, { ButtonProps } from '../Button';

const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => {
    return <Button variant="secondary" ref={ref} {...props} />;
  }
);

SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;
