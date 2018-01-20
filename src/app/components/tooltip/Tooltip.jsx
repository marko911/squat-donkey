import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './tooltip.scss';

export default class Tooltip extends Component {
  constructor() {
    super();
    this.state = {
      active: false,
      position: '',
    };
  }

  componentDidMount() {
    const containerPosition = this.container.getBoundingClientRect();
    this.setState({
      position: containerPosition,
    });
  }

  hoverToggle = active => () => this.setState({ active });

  render() {
    const { el, text } = this.props;
    const tooltipPosition = {
      left: this.state.position.left - 10,
      top: this.state.position.bottom + 16,
    };
    const wrappedEl = (
      <div
        className={s.elWrapper}
        onMouseEnter={this.hoverToggle(true)}
        onMouseLeave={this.hoverToggle(false)}
      >
        {el}
      </div>
    );
    const tooltip = (
      <div
        style={tooltipPosition}
        className={cs(s.tooltip, this.state.active && s.isActive)}
      >
        {text}
      </div>
    );

    return (
      <div className={s.tooltipWrapper} ref={x => (this.container = x)}>
        {wrappedEl}
        {this.state.active ? tooltip : null}
      </div>
    );
  }
}
