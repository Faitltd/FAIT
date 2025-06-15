import React from 'react';
import Button, { ButtonProps } from '../Button';

const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => {
    return <Button variant="primary" ref={ref} {...props} />;
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
