import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './calendar.scss';
import DayEntry from './DayEntry';

const Day = ({
  day, inRange, workouts, active, ...props
}) => (
  <Box
    {...props}
    className={cs(s.day, !inRange && s.offRange)}
  >
    <Box
      column
      className={s.flex1}
    >
      <Box
        justify="end"
        className={s.dayNumber}
      >
        <div className={cs(active ? s.active : undefined)}>{day.format('D')}</div>
      </Box>
      <DayEntry
        workouts={workouts}
      />
    </Box>
  </Box>);


export default Day;

Day.propTypes = {
  day: PropTypes.object.isRequired,
  inRange: PropTypes.bool.isRequired,
  data: PropTypes.object,
};
