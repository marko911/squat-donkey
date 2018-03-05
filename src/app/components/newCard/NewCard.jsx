import React from 'react';
import cs from 'classnames';
import {
  isEmpty,
  view,
  ifElse, append, last,
  T, without, lensPath, over, not,
  always,
} from 'ramda';
import PropTypes from 'prop-types';
import c from './newCard.scss';
import s from '../card/card.scss';
import font from '../card/fontello.scss';
import Box from '../box/Box';
import InputWithLabel from '../input/InputWithLabel';

const initialState = {
  name: '',
  instructions: '',
  exerciseBlocks: [
    {
      subheadings: [''],
      exercises: [''],
    },
  ],
  focus: {
    name: false,
    instructions: false,
    exerciseBlocks: [
      {
        subheadings: [false],
        exercises: [false],
      },
    ],
    parameters: [{
      label: false,
    }],
    recordables: [{
      label: false,
    }],
  },
  recordables: [{
    label: '',
  }],
  parameters: [{
    label: '',
  }],
  invalidFields: [],
};

const requiredFields = [
  { prop: 'name', validator: obj => !isEmpty(obj) },
];

export default class NewCard extends React.Component {
  state = initialState;

  isValidWorkout = (workoutObj) => {
    const invalidFields = [];
    const isValid = requiredFields.reduce((valid, f) => {
      const fieldValid = f.validator(workoutObj[f.prop]);
      if (!fieldValid) {
        invalidFields.push(f.prop);
      }
      return fieldValid && valid;
    }, true);
    this.setState({ invalidFields });
    return isValid;
  }

  submitWorkout =() => {
    const {
      name, instructions, exerciseBlocks, recordables,
    } = this.state;

    const workoutObj = {
      name,
      instructions,
      exerciseBlocks: exerciseBlocks.filter(block => !isEmpty(block.exercises.filter(e => !isEmpty(e)))),
      recordables: recordables.filter(r => !isEmpty(r.label)),
      records: [],
    };

    const validateAndSubmit = ifElse(
      this.isValidWorkout,
      this.props.onSubmit,
      T,
    );
    validateAndSubmit(workoutObj);
  }

  handleChange = field => ({ target: { value } }) => {
    this.setState({ [field]: value });
  }

  handleChangeArray = path => ({ target: { value } }) => this.setState(over(lensPath(path), always(value)));

  handleFocus = path => () => {
    const val = view(lensPath(path), this.state);
    const field = last(path);
    let focus = {};
    if (isEmpty(val)) {
      focus = over(lensPath(['focus', ...path]), not)(this.state);
    }
    const nextState = {
      ...focus,
      invalidFields: [...without([field], this.state.invalidFields)],
    };
    this.setState(nextState);
  }

  handleBlur = path => () => {
    const val = view(lensPath(path), this.state);
    if (isEmpty(val)) {
      this.setState(over(lensPath(['focus', ...path]), not));
    }
  }

  addSectionItem = (path, item) => () => {
    const nextItems = over(lensPath(path), append(item))(this.state);
    const toAppend = typeof (item) === 'object' ? {
      subheadings: [false],
      exercises: [false],
    } : false;
    const nextFocusAndItems = over(lensPath(['focus', ...path]), append(toAppend))(nextItems);
    this.setState({
      ...nextFocusAndItems,
    });
  }

  render() {
    const { close } = this.props;
    const name = (
      <InputWithLabel
        key="name"
        label="Workout Name/Title"
        required
        focused={this.state.focus.name}
      >
        <input
          className={cs(c.inputName, this.state.invalidFields.includes('name') && c.highlightInput)}
          value={this.state.name}
          onChange={this.handleChange('name')}
          onFocus={this.handleFocus(['name'])}
          onBlur={this.handleBlur(['name'])}
        />
      </InputWithLabel>);
    const instructions = (
      <InputWithLabel
        key="instr"
        label="Instructions"
        focused={this.state.focus.instructions}
      >
        <textarea
          rows={3}
          className={cs(c.inputName)}
          value={this.state.instructions}
          onChange={this.handleChange('instructions')}
          onFocus={this.handleFocus(['instructions'])}
          onBlur={this.handleBlur(['instructions'])}
        />
      </InputWithLabel>
    );
    const exercises = (
      <div key="exers">
        <div className={c.sectionHeading}>Exercises</div>
        {this.state.exerciseBlocks.map((block, j) => (
          <Box
            className={c.block}
            key={`block${j}`}
            column
          >
            <div className={c.blockTitle}>Block {j + 1}</div>
            {block.subheadings.map((sub, k) => (
              <InputWithLabel
                label="Subheading/Parameter"
                focused={this.state.focus.exerciseBlocks[j].subheadings[k]}
              >
                <input
                  className={c.inputName}
                  value={sub}
                  onChange={this.handleChangeArray(['exerciseBlocks', j, 'subheadings', k])}
                  onFocus={this.handleFocus(['exerciseBlocks', j, 'subheadings', k])}
                  onBlur={this.handleBlur(['exerciseBlocks', j, 'subheadings', k])}
                />
              </InputWithLabel>
                  ))}
            <Box justify="end">
              <a
                onClick={this.addSectionItem(['exerciseBlocks', j, 'subheadings'], '')}
                className={cs(s.toggleLink, c.add)}
              >Add Subheading
              </a>
            </Box>
            {
              block.exercises.map((w, i) => (
                <Box column key={`wrkt-${i}`}>
                  <div className={cs(s.flex1, s.containWidth, c.exerciseBox)}>
                    <InputWithLabel
                      required={i === 0}
                      label={`Exercise ${i + 1}`}
                      focused={this.state.focus.exerciseBlocks[j].exercises[i]}
                    >
                      <input
                        className={cs(c.inputName, i === 0 && this.state.invalidFields.includes('exercises') && c.highlightInput)}
                        value={this.state.exerciseBlocks[j].exercises[i]}
                        onChange={this.handleChangeArray(['exerciseBlocks', j, 'exercises', i])}
                        onFocus={this.handleFocus(['exerciseBlocks', j, 'exercises', i])}
                        onBlur={this.handleBlur(['exerciseBlocks', j, 'exercises', i])}
                      />
                    </InputWithLabel>
                  </div>
                </Box>
                 ))
              }
            <Box column align="end">
              <a
                onClick={this.addSectionItem(['exerciseBlocks', j, 'exercises'], '')}
                className={cs(s.toggleLink, c.add)}
              >Add Exercise
              </a>
            </Box>
          </Box>
        ))}
        <a
          onClick={this.addSectionItem(['exerciseBlocks'], {
                  subheadings: [''],
                  exercises: [''],
                })}
          className={cs(s.toggleLink, c.add)}
        >Add Block
        </a>

      </div>
    );

    const resultFields = (
      <div key="resfields">
        <div className={c.sectionHeading}>Result Fields</div>
        <div className={c.sectionSubheading}>Enter fields that will be recorded per session ie. Squat, Time, Score</div>
        {
          this.state.recordables.map((rec, i) => (
            <InputWithLabel
              key={`par-${i}`}
              label={`Result Field ${i + 1}`}
              focused={this.state.focus.recordables[i].label}
            >
              <input
                className={cs(c.inputName)}
                value={this.state.recordables[i].label}
                onChange={this.handleChangeArray(['recordables', i, 'label'])}
                onFocus={this.handleFocus(['recordables', i, 'label'])}
                onBlur={this.handleBlur(['recordables', i, 'label'])}
              />
            </InputWithLabel>
          ))
        }
        <Box justify="end">
          <a
            onClick={this.addSectionItem('recordables', '')}
            className={cs(s.toggleLink, c.add)}
          >Add
          </a>
        </Box>
      </div>
    );

    return (

      <div className={cs(c.newCardContainer, s.card)} >
        <Box className={c.newCardHeader} justify="between">
          <div>New Workout</div>
          <i onClick={close} className={cs(font.iconCancel, c.close)} />
        </Box>

        {[name, instructions, exercises, resultFields]}
        <Box className={s.sectionWrapper} justify="end">
          <div className={c.error}>
            {!isEmpty(this.state.invalidFields) && 'Enter required fields'}
          </div>
          <div onClick={this.submitWorkout} className={cs(c.btn, c.submit)}>
            Submit
          </div>
        </Box>
      </div>
    );
  }
}


NewCard.propTypes = {
  close: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

