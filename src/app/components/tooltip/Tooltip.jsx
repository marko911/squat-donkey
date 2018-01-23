import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import s from './tooltip.scss';

export default class Tooltip extends Component {
  constructor() {
    super();
    this.state = {
      active: false,
    };
  }

  hoverToggle = active => ({ target }) => {
    this.setState({ active });
    if (active) {
      const pos = target.getBoundingClientRect();
      this.setState({
        tooltipStyle: {
          left: pos.left + pos.width / 2,
          top: pos.top + pos.height + 32,
          marginLeft: -1 * (this.toolEl.offsetWidth / 2),
          marginTop: -1 * (this.toolEl.offsetHeight / 2),
        },
      });
    }
  };

  render() {
    const { el, text } = this.props;

    const wrappedEl = (
      <div
        key={sid.generate()}
        className={s.elWrapper}
        onMouseEnter={this.hoverToggle(true)}
        onMouseLeave={this.hoverToggle(false)}
      >
        {el}
      </div>
    );
    const tooltip = (
      <div
        key={sid.generate()}
        style={this.state.tooltipStyle}
        ref={y => (this.toolEl = y)}
        className={cs(s.tooltip, this.state.active && s.isActive)}
      >
        {text}
      </div>
    );

    return (
      <div onClick={this.props.onClick} className={s.tooltipWrapper}>
        {[wrappedEl, tooltip]}
      </div>
    );
  }
}
