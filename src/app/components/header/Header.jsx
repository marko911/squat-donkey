import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './header.scss';
import font from '../card/fontello.scss';
import Tooltip from '../tooltip/Tooltip';

export default class Header extends Component {
  state={};

  render() {
    const { addColumn, addIsActive } = this.props;
    const headerIcon = el => (
      <div className={s.iconButton}>
        {el}
      </div>
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
            el={headerIcon(<i className={cs(!addIsActive && font.iconPlus, addIsActive && font.iconCancel, font.iconHeader)} />)}
            text={addIsActive ? 'Cancel add column' : 'Add new column'}
          />
          <Tooltip
            onClick={() => 1}
            el={headerIcon(<i className={cs(font.iconThLarge, font.iconHeader)} />)}
            text="Template options"
          />

        </Box>
      </Box>);
  }
}
