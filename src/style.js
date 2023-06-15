import styled from "styled-components";

const AppStyle = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  .content {
    display: flex;
    height: 100%;
    width: 100%;
    .side-content {
      padding-top: 50px;
      background-color: #edf5fd;
      height: 100%;
      width: 250px;
    }
    .main-content {
      height: 100%;
      width: calc(100% - 250px);
      .canvas {
        height: calc(100% - 100px);
        width: 100%;
      }
      .controls {
        height: 100px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    @media only screen and (max-width: 600px) {
      flex-direction: column;
      flex-direction: column-reverse;
      .side-content {
        padding-top: 0;
        width: 100%;
        height: 100px;
        .MuiList-root {
          height: 100%;
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          scrollbar-width: none; /* For Firefox */
          -ms-overflow-style: none; /* For Internet Explorer and Edge */
        }
      }
      .main-content {
        width: 100%;
        height: calc(100% - 100px);
      }
    }
  }
`;

export default AppStyle;
