import React from 'react';
import cs from 'classnames';
import PropTypes from 'prop-types';
import c from '../newCard/newCard.scss';

const InputWithLabel = ({
  label, children, focused, required,
}) => (
  <div className={cs(c.textfieldFloatingLabel)}>
    {children}
    <label
      className={cs(
            c.textfieldLabel, c.floatingLabel, required && c.labelRequired,
            focused && c.isFocused,
            )}
    >
      {label}
    </label>
  </div>);

export default InputWithLabel;

InputWithLabel.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  focused: PropTypes.bool.isRequired,
  required: PropTypes.bool,
};
