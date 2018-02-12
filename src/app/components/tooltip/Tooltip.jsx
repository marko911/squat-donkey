import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import s from './tooltip.scss';

export default class Tooltip extends Component {
  static defaultProps = {
    positionShift: 0,
  };

  state = {
    active: false,
  }

  hoverToggle = active => ({ target }) => {
    this.setState(state => ({
      ...state,
      active,
    }));
    if (active) {
      const pos = target.getBoundingClientRect();
      const tooltipOverflow = document.documentElement.clientWidth - ((pos.left + pos.width / 2) + this.toolEl.offsetWidth / 2);
      const marginLeft = tooltipOverflow < 24 ? -1 * (24 - 1 * tooltipOverflow + this.toolEl.offsetWidth / 2) : -1 * (this.toolEl.offsetWidth / 2);

      this.setState({
        tooltipStyle: {
          left: pos.left + pos.width / 2,
          top: pos.top + pos.height + 20 - this.props.positionShift,
          marginLeft,
          marginTop: -1 * (this.toolEl.offsetHeight / 2),
        },
      });
    }
  };

  render() {
    const { el, text, className } = this.props;

    const wrappedEl = (
      <div
        key="wrappedEl"
        className={s.elWrapper}
        onMouseEnter={this.hoverToggle(true)}
        onMouseLeave={this.hoverToggle(false)}
      >
        {el}
      </div>
    );
    const tooltip = (
      <div
        key="tooltip-text"
        style={this.state.tooltipStyle}
        ref={y => (this.toolEl = y)}
        className={cs(s.tooltip, this.state.active && s.isActive)}
      >
        {text}
      </div>
    );

    return (
      <div onClick={this.props.onClick} className={cs(s.tooltipWrapper, className)}>
        {[wrappedEl, tooltip]}
      </div>
    );
  }
}

Tooltip.propTypes = {
  el: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  positionShift: PropTypes.number,
};