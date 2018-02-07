import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './header.scss';
import font from '../card/fontello.scss';
import Tooltip from '../tooltip/Tooltip';

export default class Header extends Component {
 renderHeaderIcon = el => (
   <div className={s.iconButton}>
     {el}
   </div>
 )
 render() {
   const {
     addColumn, addIsActive, toggleOptionsModal, showMenu,
   } = this.props;


   return (
     <div className={showMenu ? s.open : ''} >
       <div className={cs(s.menuWrap)}>
         <div className={s.menu}>
           <div className={s.iconList}>
             <Tooltip
               onClick={addColumn}
               el={this.renderHeaderIcon(<i className={cs(!addIsActive && font.iconPlus, addIsActive && font.iconCancel, font.iconHeader)} />)}
               text={addIsActive ? 'Cancel add column' : 'Add new column'}
             />
             <Tooltip
               onClick={toggleOptionsModal}
               el={this.renderHeaderIcon(<i className={cs(font.iconThLarge, font.iconHeader)} />)}
               text="Template options"
             />
           </div>
         </div>
       </div>
     </div>);
 }
}

Header.propTypes = {
  addColumn: PropTypes.func.isRequired,
  addIsActive: PropTypes.bool,
  toggleOptionsModal: PropTypes.func.isRequired,
};

{ /* <i
         onClick={this.toggleMenu}
         className={cs(font.iconMenu, s.iconMenu)}
       /> */ }
