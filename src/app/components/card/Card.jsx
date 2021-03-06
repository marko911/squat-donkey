import React from 'react';
import ReactDOM from 'react-dom';
import cs from 'classnames';
import sid from 'shortid';
import { isEmpty, head, keys, lensPath, over, always } from 'ramda';
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
    this.resetInputBoxes(this.props.data);
    this.setState({ datepickerId: 'datepickerkey' });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.name !== this.props.data.name) {
      this.resetInputBoxes(nextProps.data);
    }
  }

  onChangeDate = (date) => {
    this.submitRecord({
      date,
      results: this.state.newRecords,
    })();
    this.setState(state => ({ date: 'Date added!' }));
    setTimeout(() => this.setState({ date: '' }), 1000);
  };

  setDatePickerPosition = () => {
    const {
      top, left, right,
    } = ReactDOM.findDOMNode(this.datepicker).getBoundingClientRect();
    const datePickerPosition = {
      left: left + 92,
      top,
    };
    if (document.documentElement.clientHeight - top < (265)) {
      datePickerPosition.top = top - 244;
    }
    if ((document.documentElement.clientWidth - (right + 265)) < 24) {
      datePickerPosition.left -= (92 + 265);
    }

    this.setState({
      datePickerPosition,
    });
  }

  resetInputBoxes = (data) => {
    const newRecords = data ?
      data.recordables.map(r => '')
      : [];
    this.setState({ newRecords });
  };

  handleInput = i => ({ target: { value } }) => this.setState(over(lensPath(['newRecords', i]), always(value)))

  checkForEnter = ({ charCode }) => {
    if (charCode === 13) {
      this.submitRecord(this.props.data.name)();
    }
  };

  toggleInstructions = () =>
    this.setState({ showInstructions: !this.state.showInstructions });

  toggleCollapse = () =>
    this.setState({ showAllRecords: !this.state.showAllRecords });

  submitRecord = submission => () => {
    this.props.onSubmitRecord(submission);
    this.resetInputBoxes(this.props.data);
  };

  focusDatePicker= () => {
    this.controlDatePicker();
  }

  render() {
    const data = this.props.data || {};
    const {
      name,
      instructions = '',
      recordables = [],
      exerciseBlocks = [],
      records = [],
    } = data;

    const toggler = (
      <a
        key={sid.generate()}
        className={cs(c.toggleLink)}
        onClick={this.toggleInstructions}
      >
        {this.state.showInstructions
          ? 'Hide instructions'
          : 'Show instructions'}
      </a>
    );

    const mainText = (
      <div key={sid.generate()} className={c.cInstructions}>
        {instructions}
      </div>
    );

    const exerciseList = (
      <Box key={sid.generate()} column>
        {exerciseBlocks.map(block => (
          <div key={sid.generate()} className={c.section}>
            {
              block.subheadings.map((sh, ii) => (
                <Box
                  className={c.subheading}
                  key={ii}
                >{sh}
                </Box>
               ))
            }
            {
            block.exercises.map(e => (
              <Box className={c.exercises} justified="between" key={sid.generate()}>
                <div className={c.label}>{e}</div>
              </Box>
            ))
          }
          </div>
        ))
}
      </Box>
    );


    const inputRecords = (
      <Box
        key="footer-card"
        column
        className={cs(c.sectionWrapper)}
      >
        <Box column className={c.section}>
          {recordables.length ? recordables.map((r, i) => (
            <Box
              key={i}
              className={cs(c.recordable)}
              align="center"
              justify="between"
            >
              <div>{r}</div>
              <input
                type="text"
                value={this.state.newRecords[i]}
                onChange={this.handleInput(i)}
                onKeyPress={this.checkForEnter}
                className={c.scoreInput}
              />
            </Box>
          )) : null}
        </Box>
        <Box className={c.sectionWrapper} justify="between" align="center">
          <div
            onClick={this.submitRecord({
              date: moment(),
              results: this.state.newRecords,
            })}
            className={cs(c.btn, c.btnSecondary, c.today)}
          >
            today
          </div>
          <div className={c.spacer}> or </div>
          <DayPickerInput
            key={this.state.datepickerId}
            ref={x => this.datepicker = x}
            value={this.state.date}
            placeholder="Choose date"
            onDayChange={this.onChangeDate}
            overlayComponent={CustomOverlay(this.state.datePickerPosition)}
            inputProps={{ onClick: this.setDatePickerPosition, onFocus: this.setDatePickerPosition }}
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
    const recordsList = this.state.showAllRecords ? records
      : isEmpty(records) ? [] : [head(records)];
    const mostRecentWithCollapse = isEmpty(recordsList) ? (
      []
    ) : (
      <Box
        className={cs(c.recentRecord)}
        align="start"
        justify="between"
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
                <Box wrap>
                  {results.length ? results.map((r, j) => (
                    <div
                      key={`rec-${j}`}
                      className={cs(c.containWidth, c.value)}
                    >
                      {!isEmpty(r) ? `${recordables[j]}: ${r}` : '(completed)'}
                    </div>
                    )) : '(completed)'}
                </Box>
              </Box>
            );
          })}
        </Box>
        {
          records.length > 1
          ? this.state.showAllRecords ? caretUp : caretDown
          : null}
      </Box>
    );

    return (
      <div
        className={cs(
          c.container,
          c.card,
          isEmpty(data) && c.emptyColumn,
        )}
      >
        {!isEmpty(data) ? (
          <React.Fragment>
            <Box justify="between">
              <div className={cs(c.cardHeader)}>{name}</div>
              {this.props.editMode && deleteWorkoutIcon}
            </Box>{[
              this.state.showInstructions ? mainText : null,
              instructions.length ? toggler : null,
              exerciseList,
              inputRecords,
              mostRecentWithCollapse,
            ]}
          </React.Fragment>
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
};
