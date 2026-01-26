import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function BaseButton({
  text,
  onClick,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${fullWidth ? styles.fullWidth : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
