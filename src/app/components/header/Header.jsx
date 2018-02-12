import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './header.scss';
import font from '../card/fontello.scss';

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
           <Box className={s.iconList}>
             <a
               href="#"
               onClick={addColumn}
               className={s.wideOne}
             >
               <i className={cs(!addIsActive && font.iconPlus, addIsActive && font.iconCancel, font.iconHeader)} />
               <span>{addIsActive ? 'Cancel add column' : 'Add column'}</span>
             </a>
             <a
               href="#"
               onClick={toggleOptionsModal}
             >
               <i className={cs(font.iconSliders, font.iconHeader)} />
               <span>Template Settings</span>
             </a>
           </Box>
         </div>
       </div>
     </div>);
 }
}

Header.propTypes = {
  addColumn: PropTypes.func.isRequired,
  addIsActive: PropTypes.bool,
  toggleOptionsModal: PropTypes.func.isRequired,
  showMenu: PropTypes.bool,
};
