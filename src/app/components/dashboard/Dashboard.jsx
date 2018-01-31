import React from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { find, findIndex, propEq, without, isNil } from 'ramda';
import form from '../newCard/newCard.scss';
import s from './dashboard.scss';
import font from '../card/fontello.scss';
import Card from '../card/Card';
import Tooltip from '../tooltip/Tooltip';
import Box from '../box/Box';
import NewCard from '../newCard/NewCard';
import Header from '../header/Header';
import maximus from '../../constants/maximusBody.json';

// import TemplateIcon from '../icons/TemplateIcon';
// const maximusUrl = 'https://s3.amazonaws.com/workouttemplates/maximusBody.json';
const Slide = ({ children, ...props }) => (
  <CSSTransition
    {...props}
    timeout={{ enter: 350, exit: 0 }}
    classNames={s}
  >
    {children}
  </CSSTransition>
);


export default class Dashboard extends React.Component {
  state = {
    template: {},
    idxOfHighlighted: {},
    newCardOpen: {},
    editMode: {},
    newColumnName: '',
    addingColumnActive: false,
  }

  componentWillMount() {
    const storedTemplate = JSON.parse(localStorage.getItem('currentTemplate'));
    if (!isNil(storedTemplate)) {
      this.setState({ template: storedTemplate });
    } else {
      this.setState({ template: maximus });
    }
  }

  getCategoryAndIdx = type => ({
    data: find(propEq('type', type), this.state.template.categories),
    idx: findIndex(
      propEq('type', type),
      this.state.template.categories,
    ),
  })

  updateCurrentTemplate = (template) => {
    this.setState(state => ({
      ...state,
      template,
    }));
    localStorage.setItem('currentTemplate', JSON.stringify(template));
    // get script: const config = JSON.parse(localStorage.getItem('gdConfig'));
  }

  randomize = type => () => {
    const { data, idx } = this.getCategoryAndIdx(type);
    const randIdx = Math.round(Math.random() * (data.workouts.length - 1));
    const selected = data.workouts[randIdx];
    const reorderedList = without([selected], data.workouts);
    reorderedList.unshift(selected);
    const updatedTemplate = { ...this.state.template };
    updatedTemplate.categories[idx].workouts = reorderedList;
    this.updateCurrentTemplate(updatedTemplate);
    // border highlighting
    this.setState(state => ({
      ...state,
      idxOfHighlighted: { 0: true },
    }));
    setTimeout(() => {
      this.setState(state => ({
        ...state,
        idxOfHighlighted: {},
      }));
    }, 1000);
  };

  addWorkoutResult = ({ name, type, submission }) => {
    const updatedTemplate = { ...this.state.template };
    const { data, idx } = this.getCategoryAndIdx(type);
    const workout = find(propEq('name', name), data.workouts);
    workout.records.unshift(submission);
    const workoutIdx = findIndex(
      propEq('name', name),
      data.workouts,
    );
    updatedTemplate.categories[idx].workouts[
      workoutIdx
    ] = workout;
    this.updateCurrentTemplate(updatedTemplate);
  }

  addWorkoutToColumn = type => (workout) => {
    const { data, idx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    data.workouts.unshift(workout);
    template.categories[idx] = data;
    this.updateCurrentTemplate(template);
    this.toggleColumnState(type, 'newCardOpen')();
  }

  deleteWorkout = (type, idx) => () => {
    const { data, idx: idxCategory } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    const workoutToDelete = data.workouts[idx];
    const restOfWorkouts = without([workoutToDelete], data.workouts);
    template.categories[idxCategory].workouts = restOfWorkouts;
    this.updateCurrentTemplate(template);
  }

  deleteRecord = (type, idx) => rIdx => () => {
    const { data, idx: catIdx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    const workout = data.workouts[idx];
    const recordToDel = workout.records[rIdx];
    template.categories[catIdx].workouts[idx].records = without([recordToDel], workout.records);
    this.updateCurrentTemplate(template);
  }

  toggleColumnState =(type, prop) => () => this.setState({
    [prop]: {
      ...this.state[prop],
      [type]: !this.state[prop][type],
    },
  })

  handleChange = prop => ({ target: { value } }) => {
    this.setState({ [prop]: value });
  }

  showAddColumn = () => this.setState({ addingColumnActive: !this.state.addingColumnActive })
  addColumnToTemplate = () => {
    const template = { ...this.state.template };
    template.categories.unshift({
      type: this.state.newColumnName,
      workouts: [],
    });
    this.updateCurrentTemplate(template);
    this.setState({
      newColumnName: '',
      addingColumnActive: false,
    });
  }

  render() {
    const { categories } = this.state.template;
    const randomizeIcon = (
      <i className={cs(font.iconShuffle, font.iconShuffleColor)} />
    );
    const addWorkoutIcon = (
      <i className={cs(font.iconPlusSquared, font.iconPlusSquaredColor)} />
    );
    const editColumnIcon = (
      <i className={cs(font.iconEdit, font.iconEditColor)} />
    );
    const NewColumn = (
      <Box key="new-col-wrap" column className={s.colWrapper}>

        <Box className={s.categoryHeader} justify="between" align="center">
          <input
            className={cs(form.inputName, s.newColumnInput)}
            placeholder="Enter column name"
            value={this.state.newColumnName}
            onChange={this.handleChange('newColumnName')}
          />
          <div onClick={this.addColumnToTemplate} className={cs(s.btn, s.addCol)}>
            Add
          </div>
        </Box>
      </Box>
    );

    return (
      <Box className={cs(s.auto, s.dashWrapper)} column >
        <Header addColumn={this.showAddColumn} />
        <Box className={cs(s.dashContainer)}>
          {this.state.addingColumnActive && NewColumn}
          {categories.map((c, i) => (
            <Box key={`cat-${i}`} column className={s.colWrapper}>
              <Box className={s.categoryHeader} align="center" justify="between">
                <div>{c.type}</div>
                <Box align="center">
                  <Tooltip
                    className={font.tooltipIcon}
                    el={randomizeIcon}
                    onClick={this.randomize(c.type)}
                    text="Random workout"
                  />
                  <Tooltip
                    className={font.tooltipIcon}
                    el={addWorkoutIcon}
                    onClick={this.toggleColumnState(c.type, 'newCardOpen')}
                    text="Add workout"
                  />
                  <Tooltip
                    className={font.tooltipIcon}
                    el={editColumnIcon}
                    onClick={this.toggleColumnState(c.type, 'editMode')}
                    text={`Edit:${this.state.editMode[c.type] ? 'On' : 'Off'}`}
                  />
                </Box>
              </Box>
              <Box column className={s.workoutsContainer}>
                <TransitionGroup>
                  {this.state.newCardOpen[c.type] &&
                  <Slide key={`newcard-${c.type}`}>
                    <NewCard
                      key={sid.generate()}
                      in={this.state.newCardOpen[c.type]}
                      className={s.newCardOpen}
                      onSubmit={this.addWorkoutToColumn(c.type)}
                      close={this.toggleColumnState(c.type, 'newCardOpen')}
                    />
                  </Slide>

                }
                </TransitionGroup>

                {c.workouts.length ? c.workouts.map((w, i) => (
                  <Card
                    shouldHighlight={propEq(i, true)(this.state.idxOfHighlighted)}
                    key={sid.generate()}
                    onSubmitRecord={this.addWorkoutResult}
                    onDeleteSelf={this.deleteWorkout(c.type, i)}
                    onDeleteRecord={this.deleteRecord(c.type, i)}
                    data={w}
                    type={c.type}
                    editMode={!!this.state.editMode[c.type]}
                  />
              )) :
                <Card key={sid.generate()}>
                  <Box
                    className={s.flex1}
                    justify="center"
                    align="center"
                  >
                    <div
                      onClick={this.toggleColumnState(c.type, 'newCardOpen')}
                      className={cs(s.btn, s.addWorkoutBtn)}
                    >
                  + Add New Workout
                    </div>
                  </Box>


                </Card>
            }

              </Box>
            </Box>
      ))}
        </Box>
      </Box>

    );
  }
}

Dashboard.propTypes = {
  template: PropTypes.object,
};

Slide.propTypes = {
  children: PropTypes.node.isRequired,
};
