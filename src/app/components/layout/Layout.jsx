import React from "react";
import PropTypes from "prop-types";
import s from "../layout.scss";
import classNames from "classnames";
const Layout = ({ children }) => (
  <div className={classNames(s.main, s.box, s.col, s.alignCenter, s.flex1)}>
    {children}
  </div>
);

export default Layout;
