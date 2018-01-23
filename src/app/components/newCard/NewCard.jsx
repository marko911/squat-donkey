import React from 'react';
import cs from 'classnames';
import sid from 'shortid';
import { isEmpty, head, keys, values, compose } from 'ramda';
import PropTypes from 'prop-types';
import c from './newCard.scss';
import s from '../card/card.scss';
import Box from '../box/Box';

const InputWithLabel = ({ label, children, focused }) => (
  <div className={cs(c.textfieldFloatingLabel)}>
    {children}
    <label className={cs(c.textfieldLabel, c.floatingLabel, focused && c.isFocused)}>
      {label}
    </label>
  </div>);

export default class NewCard extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      instructions: '',
      focus: {},
    };
  }

  handleChange = field => ({ target: { value } }) => {
    this.setState({ [field]: value });
  }

  handleFocus = field => () => this.setState({
    focus: {
      [field]: true,
    },
  })

  handleBlur = field => () => {
    if (isEmpty(this.state[field])) {
      this.setState({ focus: { [field]: false } });
    }
  }


  render() {
    const name = (
      <InputWithLabel label="Workout Name" focused={this.state.focus.name}>
        <input
          className={c.inputName}
          value={this.state.name}
          onChange={this.handleChange('name')}
          onFocus={this.handleFocus('name')}
          onBlur={this.handleBlur('name')}
        />
      </InputWithLabel>);
    const instructions = (
      <InputWithLabel
        label="Instructions"
        focused={this.state.focus.instructions}
      >
        <textarea
          rows={3}
          className={cs(c.inputName)}
          value={this.state.instructions}
          onChange={this.handleChange('instructions')}
          onFocus={this.handleFocus('instructions')}
          onBlur={this.handleBlur('instructions')}
        />
      </InputWithLabel>
    );
    return (
      <div className={cs(c.newCardContainer, s.card)} >
        <div className={s.cardHeader}>New Workout</div>
        {[name, instructions]}
      </div>);
  }
}
