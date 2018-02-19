import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './calendar.scss';

const Day = ({ day, inRange, data }) => (
  <Box
    justify="end"
    className={cs(s.day, !inRange && s.offRange)}
  >
    {day.format('D')}
  </Box>);


export default Day;

Day.propTypes = {
  day: PropTypes.object.isRequired,
  inRange: PropTypes.bool.isRequired,
  data: PropTypes.object,
};
