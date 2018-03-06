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
      <Box
        align="end"
        justify="between"
        className={s.cardResult}
      >
        {results.map((r, i) => (
          <Box
            column
            align="center"
            key={sid.generate()}
          >{[
            <div key={`resname${i}`} className={s.resultName}>{workout.recordables[i]}</div>,
             r || 'N/A',
          ]}
          </Box>
          )).reduce((prev, curr) => [prev, <span key={sid.generate()} className={s.divider} />,
             curr])}
      </Box>
      <Box column>
        {workout.exerciseBlocks.map((block, i) => (
          <Box
            className={s.exercises}
            column
            key={i}
          >
            {
            block.subheadings.map((sub, j) => (
              <div key={j}>
                <div
                  className={s.cardSubheading}
                >{sub}
                </div>
              </div>
            ))
          }
            {
            block.exercises.map((e, k) => (
              <div key={k}>
                <div
                  className={s.cardLabel}
                >{e}
                </div>
              </div>))
          }
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CalendarCard;

CalendarCard.propTypes = {
  session: PropTypes.object.isRequired,
  className: PropTypes.string,
};

