import React from 'react';

function CustomOverlay(style) {
  log('custom overlay', style);
  return ({ classNames, children }) => (
    <div className={classNames.overlayWrapper} >
      <div className={classNames.overlay} style={style}>
        {children}
      </div>
    </div>
  );
}

export default CustomOverlay;
