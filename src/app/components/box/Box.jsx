import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import s from '../layout.scss';


const Box = ({
  children, column, align, auto, content, justify, className, ...props
}) => {
  const classes = cs({
    [s.auto]: auto,
    [s.box]: true,
    [s.col]: column,
    [s.center]: justify === 'center',
    [s.alignCenter]: align === 'center',
    [s.justifyStart]: justify === 'start',
    [s.alignStart]: align === 'start',
    [s.alignEnd]: align === 'end',
    [s.contentCenter]: content === 'center',
    [s.contentBetween]: content === 'between',
    [s.end]: justify === 'end',
    [s.between]: justify === 'between',
    [className]: className,
  });
  return (
    <div className={classes} {...props} >
      {children}
    </div>);
};


export default Box;

Box.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  column: PropTypes.bool,
  align: PropTypes.oneOf(['center', 'start', 'end']),
  content: PropTypes.oneOf(['center', 'start', 'end', 'between']),
  justify: PropTypes.oneOf(['center', 'start', 'end', 'between']),
  auto: PropTypes.bool,
  className: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};
