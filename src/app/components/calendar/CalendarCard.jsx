import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import { keys } from 'ramda';
import sid from 'shortid';
import Box from '../box/Box';
import s from './calendar.scss';

const CalendarCard = ({ session, className, ...props }) => {
  const {
    type, workout, results, template,
  } = session;
  return (
    <Box
      column
      className={className}
      {...props}
    >
      <Box
        className={s.woType}
        align="baseline"
      >{type}<div className={s.templateName}> ({template})</div>
      </Box>
      <div className={s.cardTitle}>{workout.name}</div>
      <Box className={s.cardResult}>
        {keys(results).map(r => (
          <div key={sid.generate()}>{results[r] ? results[r] : 'Completed without score'}</div>
          )).reduce((prev, curr) => [prev, <span className={s.divider} />,
             curr])}
      </Box>
      <Box column className={s.exercises}>
        {workout.exercises.map(e => (
          <div key={sid.generate()}>
            <div
              className={s.cardLabel}
            >{e.label}
            </div>
            {e.scheme && <div className={s.cardScheme}>{e.scheme}</div>}
          </div>
        ))}
      </Box>
      {
      workout.parameters.map(p => (
        <div
          key={sid.generate()}
          className={s.param}
        >{p}
        </div>
      ))
    }
    </Box>
  );
};

export default CalendarCard;

CalendarCard.propTypes = {
  session: PropTypes.object.isRequired,
  className: PropTypes.string,
};

