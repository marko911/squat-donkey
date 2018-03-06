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

  toggleCard = (active, workout) => ({ target }) => {
    if (!active) {
      this.setState({ cardActive: !this.state.cardActive });
    } else {
      this.setState({ currentWorkout: workout }, () => {
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
          cardActive: !this.state.cardActive,
        });
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
        {this.state.cardActive && <CalendarCard
          style={this.state.cardPosition}
          session={this.state.currentWorkout}
          className={cs(s.card, this.state.cardActive && s.active)}
        />}
        {workouts.map((w, i) => (
          <Box
            key={`sess${i}`}
            onMouseEnter={this.toggleCard(true, w)}
            onMouseLeave={this.toggleCard(false)}
          >
            <Box className={s.strip} style={getStyle(s.stripColors.split(','), w.styleIdx)} />
            <Box align="center" className={cs(s.flex1, s.entry)} style={getStyle(s.entryColors.split(','), w.styleIdx)} >
              {w.type}
            </Box>
          </Box>
        ))}

      </Box>);
  }
}

DayEntry.propTypes = {
  workouts: PropTypes.array,
};

