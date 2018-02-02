import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import s from './modal.scss';
import Box from '../box/Box';

const Modal = ({ children, onClick }) => (
  <Box
    key="modal"
    onClick={onClick}
    column
    className={s.modalDialog}
  >
    {children}
  </Box>
);

export default Modal;
