/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import './App.css'
import MenuButton from "./shared/components/MenuButton/MenuButton.tsx";

function App() {

  return (
    <>
      <div css={styles.root}>
        <div css={styles.header}>header</div>
        <div css={styles.contentRoot}>
          <div css={styles.menu}>
            <MenuButton buttonText="Menu1"></MenuButton>
          </div>
          <div css={styles.content}>content</div>
        </div>
      </div>
    </>
  )
}

export default App


const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    }`,
  header: css`
    height: 50px;
    background-color: #282c34;
  `,
  contentRoot: css`
    height: calc(100vh - 50px);
    display: flex;
    flex-direction: row;`,
  menu: css`
    width: 200px;
    height: 100%;
    background-color: #282c34;`,
  content: css`
    height: 100%;
    width: 100%;
    background-color: #303030;`
}