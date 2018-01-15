import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import App from "./app/components/App";

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById("root")
  );
};

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept("./app/components/App", () => {
    render(App);
  });
}
