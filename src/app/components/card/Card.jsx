import React from 'react';
import ReactDOM from 'react-dom';
import cs from 'classnames';
import sid from 'shortid';
import { isEmpty, head, keys } from 'ramda';
import PropTypes from 'prop-types';
import moment from 'moment';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import c from './card.scss';
import './datepicker.css';
import font from '../card/fontello.scss';
import Box from '../box/Box';
import CustomOverlay from './CustomOverlay';

export default class Card extends React.Component {
  state = {
    showInstructions: false,
    showAllRecords: false,
    date: '',
  };

  componentWillMount() {
    this.resetInputBoxes();
    this.setState({ datepickerId: sid.generate() });
  }

  onChangeDate = (date) => {
    this.submitRecord(this.props.data.name, {
      date,
      results: this.state.newRecords,
    })();
    this.datepicker.setState({ value: '' });
  };

  setDatePickerPosition = () => {
    const {
      top, left,
    } = ReactDOM.findDOMNode(this.datepicker).getBoundingClientRect();
    const datePickerPosition = {
      left: left + 92,
      top: top - 48,
    };
    if (document.documentElement.clientHeight - top < (265)) {
      datePickerPosition.top = top - 280;
    }
    this.setState({
      datePickerPosition,
    });
  }

  resetInputBoxes = () => {
    const newRecords = this.props.data
      ? this.props.data.recordables.reduce(
        (acc, rec) => ({
          ...acc,
          [rec.label]: '',
        }),
        {},
      )
      : [];
    this.setState({ newRecords });
  };

  handleInput = label => ({ target: { value } }) =>
    this.setState({
      newRecords: {
        ...this.state.newRecords,
        [label]: value,
      },
    });

  checkForEnter = ({ charCode }) => {
    if (charCode === 13) {
      this.submitRecord(this.props.data.name)();
    }
  };

  toggleInstructions = () =>
    this.setState({ showInstructions: !this.state.showInstructions });
  toggleCollapse = () =>
    this.setState({ showAllRecords: !this.state.showAllRecords });

  submitRecord = (name, submission) => () => {
    this.props.onSubmitRecord({
      type: this.props.type,
      name,
      submission,
    });
    this.resetInputBoxes();
  };

  controlDatePicker = () => {
    this.setDatePickerPosition();
    this.datepicker.setState({ showOverlay: true });
  }

  render() {
    const data = this.props.data || {};
    const {
      name,
      instructions = '',
      recordables = [],
      exercises = [],
      parameters = [],
      records = [],
    } = data;
    const toggler = (
      <a
        key={sid.generate()}
        className={cs(c.toggleLink, c.lineItem)}
        onClick={this.toggleInstructions}
      >
        {this.state.showInstructions
          ? 'Hide instructions'
          : 'Show instructions'}
      </a>
    );

    const mainText = (
      <div key={sid.generate()} className={c.lineItem}>
        {instructions}
      </div>
    );

    const exerciseList = (
      <Box key={sid.generate()} column className={c.lineItem}>
        {exercises.map(e => (
          <Box className={c.exercises} justified="between" key={sid.generate()}>
            <div className={c.label}>{e.label}</div>
            <div className={c.value}>{e.scheme}</div>
          </Box>
        ))}
      </Box>
    );

    const workoutParams = (
      <div key={sid.generate()} className={cs(c.sectionWrapper)}>
        {parameters.map(p => <div key={sid.generate()}>{p}</div>)}
      </div>
    );


    const inputRecords = (
      <Box key="footer-card" column className={c.sectionWrapper}>
        <Box column>
          {recordables.map((r, i) => (
            <Box
              key={i}
              className={cs(c.recordable)}
              align="center"
              justify="between"
            >
              <div>{r.label}</div>
              <input
                type="text"
                value={this.state.newRecords[r.label]}
                onChange={this.handleInput(r.label)}
                onKeyPress={this.checkForEnter}
                className={c.scoreInput}
              />
            </Box>
          ))}
        </Box>
        <Box className={c.sectionWrapper} justify="between" align="center">
          <div
            onClick={this.submitRecord(name, {
              date: moment(),
              results: this.state.newRecords,
            })}
            className={cs(c.btn, c.today)}
          >
            today
          </div>
          <div className={c.spacer}> or </div>
          <DayPickerInput
            key={this.state.datepickerId}
            ref={x => this.datepicker = x}
            value={this.state.date}
            placeholder="Choose date"
            inputProps={{ onClick: this.controlDatePicker, onFocus: this.controlDatePicker }}
            onDayChange={this.onChangeDate}
            overlayComponent={CustomOverlay(this.state.datePickerPosition)}
          />
        </Box>
      </Box>
    );
    const caretDown = (
      <i onClick={this.toggleCollapse} className={c.iconAngleDown} />
    );
    const caretUp = (
      <i onClick={this.toggleCollapse} className={c.iconAngleUp} />
    );
    const deleteWorkoutIcon = (
      <i
        onClick={this.props.onDeleteSelf}
        className={cs(font.iconTrashEmpty)}
      />
    );
    const recordsList = this.state.showAllRecords
      ? records
      : isEmpty(records) ? [] : [head(records)];
    const mostRecentWithCollapse = isEmpty(recordsList) ? (
      []
    ) : (
      <Box
        className={cs(c.recentRecord)}
        align="start"
        key={data.name ? `records-${name}` : 'somekey'}
      >
        <Box column className={cs(c.containWidth, c.flex1)}>
          {recordsList.map((rec, i) => {
            const dateOfResult = moment(rec.date).format('DDMMMYYYY');
            const results = isEmpty(rec) ? [] : rec.results;
            return (
              <Box className={c.recordRow} key={`reclis-${i}`}>
                {this.props.editMode && (
                  <i
                    onClick={this.props.onDeleteRecord(i)}
                    className={cs(font.iconTrashEmpty, font.iconTrashSmall)}
                  />
                )}
                <div className={c.date}>{dateOfResult}</div>
                <Box column className={cs(c.flex1)}>
                  {keys(results).map((r, j) => {
                    const val = results[r];
                    return (
                      <div
                        key={`rec-${j}`}
                        className={cs(c.containWidth, c.value, c.flex1)}
                      >
                        {!isEmpty(val) ? `${r}: ${val}` : '(completed)'}
                      </div>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
        {records.length > 1
          ? this.state.showAllRecords ? caretUp : caretDown
          : null}
      </Box>
    );

    return (
      <div
        className={cs(
          c.container,
          c.card,
          this.props.shouldHighlight && c.workoutHighlighted,
          isEmpty(data) && c.emptyColumn,
        )}
      >
        {!isEmpty(data) ? (
          <><Box justify="between">
            <div className={c.cardHeader}>{name}</div>
            {this.props.editMode && deleteWorkoutIcon}
            </Box>{[
              this.state.showInstructions ? mainText : null,
              instructions.length ? toggler : null,
              exerciseList,
              parameters.length ? workoutParams : null,
              inputRecords,
              mostRecentWithCollapse,
            ]}</>
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}

Card.propTypes = {
  data: PropTypes.object,
  onSubmitRecord: PropTypes.func,
  onDeleteSelf: PropTypes.func,
  editMode: PropTypes.bool,
  shouldHighlight: PropTypes.bool,
};
