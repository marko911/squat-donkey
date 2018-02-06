import React from 'react';

const CustomOverlay = style => ({ classNames, selectedDay, children }) => (
  <div className={classNames.overlayWrapper} >
    <div className={classNames.overlay} style={style}>
      {children}
    </div>
  </div>
);

export default CustomOverlay;
