import React from 'react';
import cs from 'classnames';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import Box from '../box/Box';
import Day from './Day';
import s from './calendar.scss';

const moment = extendMoment(Moment);

export default class Calendar extends React.Component {
  state = {
  }

  componentWillMount() {
    this.setWeeksForThisMonth();
  }

  setWeeksForThisMonth = () => {
    const firstDateOfFirstWeek = moment(moment().startOf('month')).startOf('week');
    const firstDayOfEachWeek = moment.range(firstDateOfFirstWeek, moment().endOf('month'));
    const weeks = Array.from(firstDayOfEachWeek.by('week'))
      .map(w => Array.from(moment.range(w, moment(w).endOf('week')).by('day')));
    this.setState({ weeks });
  }

  isInMonth = date => moment(date).isSame(moment(), 'month')

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
              {moment().format('MMMM')}
              <div className={s.year}>{moment().format('YYYY')}</div>
            </Box>
          </Box>

          <Box column className={s.calendarContainer} >
            <Box className={cs(s.daysOfWeek)}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <Box
                  key={d}
                  className={cs(s.flex1, s.th, s.days)}
                  justify="end"
                  align="end"
                >{d}
                </Box>
            ))}
            </Box>
            {this.state.weeks.map(week => (
              <Box className={s.week}>
                {week.map(day => (
                  <Day
                    inRange={this.isInMonth(day)}
                    day={day}
                  />

                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
}

