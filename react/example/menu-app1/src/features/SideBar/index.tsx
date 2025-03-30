/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import MenuButton from "../../shared/components/MenuButton/MenuButton";
import GetMenuItems from "./sidebar-data";

const Sidebar = () => {
  const menuItems = GetMenuItems();
  return (
    <>
        <div css={styles.sidebar}>
          {menuItems.map((item) => (
            <MenuButton key={item.id} buttonText={item.name} />
          ))}
        </div>
    </>
  );
}
export default Sidebar;

const styles = {
  sidebar: css`
    width: 200px;
    background-color: #282c34;
    color: white;
    padding: 20px;
    height: 100vh;
  `,
}
