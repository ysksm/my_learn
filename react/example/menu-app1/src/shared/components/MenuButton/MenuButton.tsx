/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

type MenuButtonProps = {
  buttonText: string;
}

const MenuButton = ({buttonText}: MenuButtonProps) => {
  return (
    <>
        <button css={styles.button}>{buttonText}</button>
    </>
  );
}

export default MenuButton;

const styles = {
  button: css`
    background-color: #282c34;
    width: 100%;
    height: 50px;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    &:hover {
        background-color: #3a3f47;
    }
    &:active {
        background-color: #4a4f57;
    }
    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px #61dafb;
    }
  `
}