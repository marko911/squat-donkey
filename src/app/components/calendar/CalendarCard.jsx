import React from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import Box from '../box/Box';
import s from './calendar.scss';

const CalendarCard = ({ session, className, ...props }) => {
  const {
    workout, results, template: templateName,
  } = session;
  log('sessss', session);
  return (
    <Box
      column
      className={className}
      {...props}
    >
      <div className={s.cardTitle}>{workout.name}
        <div className={s.templateName}> {templateName}</div>
      </div>

      <Box className={s.workoutBlock} column>
        {workout.exerciseBlocks.map((block, i) => (
          <Box
            className={s.exercises}
            column
            key={i}
          >
            {
            block.subheadings.map((sub, j) => (
              <div
                key={j}
                className={s.cardSubheading}
              >{sub}
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
      {
        !!results.length &&
        <Box
          align="end"
          justify="between"
          className={s.cardResult}
        >
          { results.map((r, i) => (
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
             curr], [])}
        </Box>
      }

    </Box>
  );
};

export default CalendarCard;

CalendarCard.propTypes = {
  session: PropTypes.object.isRequired,
  className: PropTypes.string,
};

