import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Box from '../box/Box';
import s from './dayEntry.scss';
import CalendarCard from './CalendarCard';

const getStyle = (list, idx) => ({
  background: list[idx] || list[0],
});

export default class DayEntry extends React.Component {
  state={ cardActive: false }

  toggleCard = active => ({ target }) => {
    log('tog', active);
    this.setState({ cardActive: !this.state.cardActive });
    if (active) {
      const pos = target.getBoundingClientRect();
      const cardPosition = {
        top: pos.top + pos.height - 24,
        left: pos.left + pos.width + 16,
      };

      const horizDiff = document.documentElement.clientWidth - (pos.right + 245 + 24);
      const vertDiff = (document.documentElement.clientHeight - pos.top - 16) - 300;
      if (vertDiff < 0) {
        cardPosition.top += vertDiff - 2;
      }
      if (horizDiff < 0) {
        cardPosition.left = pos.left - 245 - 16;
      }

      this.setState({
        cardPosition,
      });
    }
  }

  render() {
    const { workouts } = this.props;
    return (
      <Box
        column
        className={cs(s.entryContainer, s.flex1)}
      >
        {workouts.map((w, i) => (
          <React.Fragment>
            <Box
              key="sess"
              onMouseEnter={this.toggleCard(true)}
              onMouseLeave={this.toggleCard(false)}
            >
              <Box className={s.strip} style={getStyle(s.stripColors.split(','), w.styleIdx)} />
              <Box align="center" className={cs(s.flex1, s.entry)} style={getStyle(s.entryColors.split(','), w.styleIdx)} >
                {w.type}
              </Box>
            </Box>
            <CalendarCard
              style={this.state.cardPosition}
              session={w}
              className={cs(s.card, this.state.cardActive && s.active)}
            />
          </React.Fragment>
        ))}

      </Box>);
  }
}

DayEntry.propTypes = {
  workouts: PropTypes.array,
};

