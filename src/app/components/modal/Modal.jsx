import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import s from './modal.scss';
import Box from '../box/Box';

const Modal = ({ children, className, ...props }) => (
  <Box
    key="modal"
    {...props}
    column
    className={cs(s.modalDialog, className)}
  >
    {children}
  </Box>
);

export default Modal;
