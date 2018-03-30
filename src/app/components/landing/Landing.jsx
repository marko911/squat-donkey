import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './landing.scss';

const Landing = ({ stockTemplates, createNew, loadTemplate }) => (
  <Box column className={s.flex1}>
    <header >
      <h2>
            Select template
      </h2>
    </header>

    <Box
      wrap
      className={cs(s.cardsWrapper)}
    >
      <Box
        align="center"
        justify="center"
        className={s.card}
        onClick={createNew}
      >
        <h3 className={s.new}>Blank</h3>
      </Box>
      {stockTemplates.map((template, i) => (
        <Box
          key={`stock${i}`}
          align="center"
          justify="center"
          className={s.card}
          onClick={loadTemplate(template)}
        >
          <h3>{template.templateName}</h3>
        </Box>
          ))}
    </Box>
  </Box>
);

export default Landing;

Landing.propTypes = {
  stockTemplates: PropTypes.array,
  createNew: PropTypes.func.isRequired,
  loadTemplate: PropTypes.func.isRequired,
};
