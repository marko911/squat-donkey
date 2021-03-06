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
  state={ cardActive: false, currentWorkout: {} }

  closeCard = () => this.setState(state => ({
    ...state,
    cardActive: !this.state.cardActive,
  }));
  openCard = workout => ({ target }) => {
    this.setState(state => ({
      ...state,
      currentWorkout: workout,
    }), () => {
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
      this.setState(state => ({
        ...state,
        cardPosition,
        cardActive: !this.state.cardActive,
      }));
    });
  }

  render() {
    const { workouts, day } = this.props;
    return (
      <div
        className={cs(s.entryContainer, s.flex1)}
      >
        {this.state.cardActive && <CalendarCard
          style={this.state.cardPosition}
          session={this.state.currentWorkout}
          className={cs(s.card, this.state.cardActive && s.active)}
        />}
        {workouts.map((w, i) => (
          <Box
            id={`hover${i}`}
            key={`${day.format('D') + i}`}
            onMouseEnter={this.openCard(w)}
            onMouseLeave={this.closeCard}
          >
            <Box className={s.strip} style={getStyle(s.stripColors.split(','), w.styleIdx)} />
            <Box
              align="center"
              className={cs(s.flex1, s.entry)}
              style={getStyle(s.entryColors.split(','), w.styleIdx)}
            >
              {w.type}
            </Box>
          </Box>
        ))}
      </div>);
  }
}

DayEntry.propTypes = {
  workouts: PropTypes.array,
  day: PropTypes.object,
};

