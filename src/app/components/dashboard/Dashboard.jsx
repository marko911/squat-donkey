import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import { find, findIndex, propEq } from 'ramda';
import s from './dashboard.scss';
import font from '../card/fontello.scss';
import Card from '../card/Card';
import Tooltip from '../tooltip/Tooltip';
import Box from '../box/Box';
import maximus from '../../constants/maximusBody.json';

// const maximusUrl = 'https://s3.amazonaws.com/workouttemplates/maximusBody.json';

export default class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      template: {},
    };
  }

  componentWillMount() {
    this.setState({ template: maximus });
  }

  addWorkoutResult = ({ name, type, submission }) => {
    const updatedTemplate = { ...this.state.template };
    const matchingCategory = find(
      propEq('type', type),
      updatedTemplate.categories,
    );
    const matchingCategoryIdx = findIndex(
      propEq('type', type),
      updatedTemplate.categories,
    );
    const workout = find(propEq('name', name), matchingCategory.workouts);
    workout.records.unshift(submission);
    const workoutIdx = findIndex(
      propEq('name', name),
      matchingCategory.workouts,
    );
    updatedTemplate.categories[matchingCategoryIdx].workouts[
      workoutIdx
    ] = workout;
    this.setState({ template: updatedTemplate });
  };

  render() {
    const { categories } = this.state.template;
    const randomizeIcon = (
      <i className={cs(font.iconShuffle, s.iconRandomize)} />
    );
    return (
      <Box className={cs(s.flex1, s.dashContainer)}>
        {categories.map(c => (
          <Box column className={s.colWrapper}>
            <Box className={s.categoryHeader} align="center" justify="between">
              {c.type}
              <Box align="center">
                <Tooltip el={randomizeIcon} text="Show random workout" />

                <i className={cs(font.iconPlusSquared, s.iconAddWorkout)} />
                <i
                  className={cs(font.iconMinusSquared, s.iconMinimizeColumn)}
                />
              </Box>
            </Box>
            <Box column className={s.workoutsContainer}>
              {c.workouts.map(w => (
                <Card
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
