import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './calendar.scss';


const SessionCard = ({ session, className, ...props }) => (
  <Box
    column
    className={className}
    {...props}
  >
    <div className={s.woType}>{session.type}</div>
    <div className={s.cardTitle}>{session.workout.name}</div>
    {session.workout.exercises.map(e => (
      <Box column className={s.exercises}>
        <div className={s.cardLabel} >{e.label}</div>
        <div className={s.cardScheme}>{e.scheme}</div>
      </Box>
    ))}
  </Box>
);

export default SessionCard;

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  className: PropTypes.string,
};

