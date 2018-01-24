import React from 'react';
import cs from 'classnames';
import sid from 'shortid';
import { isEmpty, head, keys, ifElse, gt, compose, prop } from 'ramda';
import PropTypes from 'prop-types';
import c from './newCard.scss';
import s from '../card/card.scss';
import font from '../card/fontello.scss';
import Box from '../box/Box';

const InputWithLabel = ({ label, children, focused }) => (
  <div className={cs(c.textfieldFloatingLabel)}>
    {children}
    <label className={cs(c.textfieldLabel, c.floatingLabel, focused && c.isFocused)}>
      {label}
    </label>
  </div>);

const initialState = {
  name: '',
  instructions: '',
  exercises: [{
    label: '',
    scheme: '',
  }, {
    label: '',
    scheme: '',
  }],
  focus: {
    name: false,
    instructions: false,
    exercises: [{
      label: false,
      scheme: false,
    }, {
      label: false,
      scheme: false,
    }],
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
  { prop: 'exercises', validator: compose(gt(0), prop('length')) },
];

export default class NewCard extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

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

  highlightInvalidFields = (obj) => { console.log('invalid'); }
  submitWorkout =() => {
    const {
      name, instructions, exercises, parameters, recordables,
    } = this.state;

    const workoutObj = {
      name,
      instructions,
      exercises: exercises.filter(e => !isEmpty(e.label)),
      parameters: parameters.map(p => p.label),
      recordables,
      records: [],
    };

    const validateAndSubmit = ifElse(
      this.isValidWorkout,
      this.props.onSubmit,
      this.highlightInvalidFields,
    );
    validateAndSubmit(workoutObj);
  }


  handleChange = field => ({ target: { value } }) => {
    this.setState({ [field]: value });
  }

  handleChangeArray = (i, ...path) => ({ target: { value } }) => {
    const propName = path.shift();
    const newList = [...this.state[propName]];
    newList[i][path.shift()] = value;
    this.setState({
      [propName]: newList,
    });
  }

  handleFocus = (field, ...path) => () => {
    if (isEmpty(path)) {
      this.setState({
        focus: {
          ...this.state.focus,
          [field]: true,
        },
      });
    } else {
      const newList = [...this.state.focus[field]];
      newList[head(path)][path[1]] = true;
      this.setState({
        focus: {
          ...this.state.focus,
          [field]: newList,
        },
      });
    }
  }

  handleBlur = (field, ...path) => () => {
    if (isEmpty(path)) {
      if (isEmpty(this.state[field])) {
        this.setState({
          focus: {
            ...this.state.focus,
            [field]: false,
          },
        });
      }
    } else if (isEmpty(this.state[field][head(path)][path[1]])) {
      const newList = [...this.state.focus[field]];
      newList[head(path)][path[1]] = false;
      this.setState({
        focus: {
          ...this.state.focus,
          [field]: newList,
        },
      });
    }
  }

  addSectionInput = field => () => {
    const fieldKeys = keys(this.state[field][0]);
    const list = [...this.state[field], fieldKeys.reduce(
      (curr, next) => (
        {
          [next]: '',
        }),
      {},
    )];
    const focus = { ...this.state.focus };
    const focusKeys = keys(focus[field][0]);
    focus[field].push(focusKeys.reduce(
      (curr, next) => (
        {
          [next]: false,
        }
      ),
      {},
    ));
    this.setState({
      [field]: list,
      focus,
    });
  }


  render() {
    const { close } = this.props;
    const name = (
      <InputWithLabel
        key="name"
        label="Workout Name"
        focused={this.state.focus.name}
      >
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
        key="instr"
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
    const exercises = (
      <div key="exers">
        <div className={c.sectionHeading}>Exercises</div>

        {
        this.state.exercises.map((w, i) => (
          <Box key={`wrkt-${i}`}>
            <div className={cs(s.flex1, s.containWidth, c.exerciseBox)}>
              <InputWithLabel label={`Exercise ${i + 1}`} focused={this.state.focus.exercises[i].label}>
                <input
                  className={c.inputName}
                  value={this.state.exercises[i].label}
                  onChange={this.handleChangeArray(i, 'exercises', 'label')}
                  onFocus={this.handleFocus('exercises', i, 'label')}
                  onBlur={this.handleBlur('exercises', i, 'label')}
                />
              </InputWithLabel>
            </div>
            <div className={cs(s.flex1, s.containWidth, c.exerciseBox)}>
              <InputWithLabel label="Reps/Weights" focused={this.state.focus.exercises[i].scheme}>
                <input
                  className={c.inputName}
                  value={this.state.exercises[i].scheme}
                  onChange={this.handleChangeArray(i, 'exercises', 'scheme')}
                  onFocus={this.handleFocus('exercises', i, 'scheme')}
                  onBlur={this.handleBlur('exercises', i, 'scheme')}
                />
              </InputWithLabel>
            </div>
          </Box>
        ))
      }
        <Box justify="end">
          <a
            onClick={this.addSectionInput('exercises')}
            className={cs(s.toggleLink, c.add)}
          >Add
          </a>
        </Box>
      </div>
    );
    const parameters = (
      <div key="params">
        <div className={c.sectionHeading}>Workout Parameters</div>
        <div className={c.sectionSubheading}>{'i.e. \'Time : 15-20 mins\''}</div>
        <div className={c.sectionSubheading}>{'or \'Max Reps in 30 mins\''}</div>
        {
          this.state.parameters.map((param, i) => (
            <InputWithLabel
              key={`par-${i}`}
              label={`Parameter ${i + 1}`}
              focused={this.state.focus.parameters[i].label}
            >
              <input
                className={cs(c.inputName)}
                value={this.state.parameters[i].label}
                onChange={this.handleChangeArray(i, 'parameters', 'label')}
                onFocus={this.handleFocus('parameters', i, 'label')}
                onBlur={this.handleBlur('parameters', i, 'label')}
              />
            </InputWithLabel>
        ))
        }
        <Box justify="end">
          <a
            onClick={this.addSectionInput('parameters')}
            className={cs(s.toggleLink, c.add)}
          >Add
          </a>
        </Box>
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
                onChange={this.handleChangeArray(i, 'recordables', 'label')}
                onFocus={this.handleFocus('recordables', i, 'label')}
                onBlur={this.handleBlur('recordables', i, 'label')}
              />
            </InputWithLabel>
          ))
        }
        <Box justify="end">
          <a
            onClick={this.addSectionInput('recordables')}
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

        {[name, instructions, exercises, parameters, resultFields]}
        <Box className={c.sectionWrapper} justify="end">
          <div onClick={this.submitWorkout} className={cs(s.btn, c.submit)}>
            Submit
          </div>
        </Box>
      </div>);
  }
}


NewCard.propTypes = {
  close: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};


InputWithLabel.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  focused: PropTypes.bool.isRequired,
};
