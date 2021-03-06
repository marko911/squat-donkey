import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import s from '../layout.scss';
import rootStyle from '../root.scss';
import Box from '../box/Box';

const Layout = ({ children }) => (
  <Box className={cs(s.dashWrapper)}>
    {children}
  </Box>
);

export default Layout;
