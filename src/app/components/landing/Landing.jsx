import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './landing.scss';

export default class Landing extends React.Component {
  state = {

  }

  render() {
    const { stockTemplates, createNew, loadTemplate } = this.props;
    return (
      <Box column className={s.flex1}>
        <header >
          <h2>
            Select template
          </h2>
        </header>

        <Box
          wrap
          className={cs(s.cardsWrapper)}
          justify="around"
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
  }
}


Landing.propTypes = {
  stockTemplates: PropTypes.array,
  createNew: PropTypes.func.isRequired,
  loadTemplate: PropTypes.func.isRequired,
};
