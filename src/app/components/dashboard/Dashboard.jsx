import React from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { find, findIndex, propEq, without } from 'ramda';
import s from './dashboard.scss';
import font from '../card/fontello.scss';
import Card from '../card/Card';
import Tooltip from '../tooltip/Tooltip';
import Box from '../box/Box';
import NewCard from '../newCard/NewCard';
import maximus from '../../constants/maximusBody.json';

// const maximusUrl = 'https://s3.amazonaws.com/workouttemplates/maximusBody.json';

export default class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      template: {},
      idxOfHighlighted: {},
      newCardOpen: {},
    };
  }

  componentWillMount() {
    this.setState({ template: maximus });
  }

  getCategoryAndIdx = type => ({
    data: find(propEq('type', type), this.state.template.categories),
    idx: findIndex(
      propEq('type', type),
      this.state.template.categories,
    ),
  })

  randomize = type => () => {
    const { data, idx } = this.getCategoryAndIdx(type);
    const randIdx = Math.round(Math.random() * (data.workouts.length - 1));
    const selected = data.workouts[randIdx];
    const reorderedList = without([selected], data.workouts);
    reorderedList.unshift(selected);
    const updatedTemplate = { ...this.state.template };
    updatedTemplate.categories[idx].workouts = reorderedList;
    this.setState(state => ({
      ...state,
      template: updatedTemplate,
    }));
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
    this.setState({ template: updatedTemplate });
  }

  addWorkoutToColumn = type => (workout) => {
    const { data, idx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    data.workouts.unshift(workout);
    template.categories[idx] = data;
    this.setState({ template });
    this.toggleNewCardOpen(type)();
  }

  toggleNewCardOpen =type => () => this.setState({
    newCardOpen: {
      ...this.state.newCardOpen,
      [type]: !this.state.newCardOpen[type],
    },
  })

  render() {
    const { categories } = this.state.template;
    const randomizeIcon = (
      <i className={cs(font.iconShuffle, s.iconRandomize)} />
    );
    const addWorkoutIcon = (
      <i className={cs(font.iconPlusSquared, s.iconAddWorkout)} />
    );
    const minimizeColumnIcon = (
      <i className={cs(font.iconMinusSquared, s.iconMinimizeColumn)} />
    );
    const Slide = ({ children, ...props }) => (
      <CSSTransition
        {...props}
        timeout={{ enter: 350, exit: 0 }}
        classNames={s}
      >
        {children}
      </CSSTransition>
    );
    return (
      <Box className={cs(s.flex1, s.dashContainer)}>
        {categories.map((c, i) => (
          <Box key={`cat-${i}`} column className={s.colWrapper}>
            <Box className={s.categoryHeader} align="center" justify="between">
              <div>{c.type}</div>
              <Box align="center">
                <Tooltip
                  className={s.tooltipIcon}
                  el={randomizeIcon}
                  onClick={this.randomize(c.type)}
                  text="Random workout"
                />
                <Tooltip
                  className={s.tooltipIcon}
                  el={addWorkoutIcon}
                  onClick={this.toggleNewCardOpen(c.type)}
                  text="Add workout"
                />
                <Tooltip className={s.tooltipIcon} el={minimizeColumnIcon} text="Hide Column" />
              </Box>
            </Box>
            <Box column className={s.workoutsContainer}>
              <TransitionGroup>
                {this.state.newCardOpen[c.type] &&
                <Slide key={`newcard-${c.type}`}>
                  <NewCard
                    in={this.state.newCardOpen[c.type]}
                    className={s.newCardOpen}
                    onSubmit={this.addWorkoutToColumn(c.type)}
                    close={this.toggleNewCardOpen(c.type)}
                  />
                </Slide>

                }
              </TransitionGroup>

              {c.workouts.map((w, i) => (
                <Card
                  shouldHighlight={propEq(i, true)(this.state.idxOfHighlighted)}
                  key={sid.generate()}
                  onSubmitRecord={this.addWorkoutResult}
                  data={w}
                  type={c.type}
                />
              ))}

            </Box>
          </Box>
      ))}
      </Box>
    );
  }
}
