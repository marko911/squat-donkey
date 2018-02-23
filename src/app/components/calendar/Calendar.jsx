import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Moment from 'moment';
import sid from 'shortid';
import { extendMoment } from 'moment-range';
import Box from '../box/Box';
import Day from './Day';
import Tooltip from '../tooltip/Tooltip';
import s from './calendar.scss';
import font from '../card/fontello.scss';

const moment = extendMoment(Moment);

export default class Calendar extends React.Component {
  static defaultProps = {
    workouts: [],
  };
  state = {
    currentMonth: moment().month(),
    workouts: [],
  }

  componentWillMount() {
    this.setWeeksForMonth(this.state.currentMonth);
    this.setState({ workouts: this.props.workouts });
  }

  setWeeksForMonth = (m) => {
    const currentMonth = moment().month(m);
    const firstDateOfFirstWeek = moment(currentMonth.startOf('month')).startOf('week');
    const firstDayOfEachWeek = moment.range(firstDateOfFirstWeek, currentMonth.endOf('month'));
    const weeks = Array.from(firstDayOfEachWeek.by('week'))
      .map(w => Array.from(moment.range(w, moment(w).endOf('week')).by('day')));
    this.setState({ weeks });
  }

  getWorkoutsForDate = (date, workouts) => workouts.filter(w => moment(date).isSame(moment(w.date), 'day'))

  isInMonth = date => moment(date).isSame(moment().month(this.state.currentMonth), 'month')

  isToday = date => moment().isSame(moment(date), 'day')

  isDayOfWeek = (date, i) => (moment().month() !== this.state.currentMonth ? false : moment(date).day() === i);

  changeMonth = direction => () => this.setState(
    { currentMonth: direction === 'next' ? this.state.currentMonth + 1 : this.state.currentMonth - 1 },
    () => this.setWeeksForMonth(this.state.currentMonth),
  )

  render() {
    return (
      <Box className={cs(s.flex1)} >
        <Box column className={cs(s.calWrapper, s.flex1)}>

          <Box
            className={s.header}
            justify="center"
            align="center"
          >
            <Box
              align="center"
              justify="center"
              column
              className={s.monthToggle}
            >
              <Box className={s.monthSlider}>
                <Box
                  onClick={this.changeMonth('previous')}
                  justify="center"
                  align="center"
                  className={s.arrowWrap}
                ><i className={cs(font.iconAngleLeft, s.iconArrow)} />
                </Box>
                <Box
                  justify="center"
                  align="center"
                  className={s.month}
                >{moment().month(this.state.currentMonth).format('MMMM')}
                </Box>
                <Box
                  onClick={this.changeMonth('next')}
                  justify="center"
                  align="center"
                  className={s.arrowWrap}
                ><i className={cs(font.iconAngleRight, s.iconArrow)} />
                </Box>
              </Box>
              <div className={s.year}>{moment().month(this.state.currentMonth).format('YYYY')}</div>
            </Box>
          </Box>

          <Box column className={s.calendarContainer} >
            <Box className={cs(s.daysOfWeek)}>
              {moment.weekdaysShort()
                .map((d, i) => (
                  <Box
                    key={d}
                    className={cs(s.flex1, s.th, s.days, this.isDayOfWeek(moment().month(this.state.currentMonth), i) ? s.active : undefined)}
                    justify="end"
                    align="end"
                  >{d}
                  </Box>
            ))}
            </Box>
            {this.state.weeks.map(week => (
              <Box key={sid.generate()} className={s.week}>
                {week.map((day) => {
                  const workouts = this.getWorkoutsForDate(day, this.state.workouts);
                  return (
                    <Day
                      workouts={workouts}
                      active={this.isToday(day)}
                      key={sid.generate()}
                      inRange={this.isInMonth(day)}
                      day={day}
                    />

                );
 })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
}

