import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import Box from '../box/Box';
import s from './header.scss';
import font from '../card/fontello.scss';
import Tooltip from '../tooltip/Tooltip';

export default class Header extends Component {
  state={};

  render() {
    const { addColumn } = this.props;
    const addColumnIcon = (
      <i className={cs(font.iconDocAdd, font.iconHeader)} />
    );
    return (
      <Box className={s.header}>
        <Box
          align="center"
          justify="end"
          className={cs(s.container, s.flex1)}
        >
          <Tooltip
            onClick={addColumn}
            className={font.tooltipIcon}
            el={addColumnIcon}
            text="Add new column"
          />

        </Box>
      </Box>);
  }
}
