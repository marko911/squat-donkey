import React from 'react';
import cs from 'classnames';
import sid from 'shortid';
import { isEmpty, head, keys, values } from 'ramda';
import PropTypes from 'prop-types';
import moment from 'moment';
import c from './card.scss';
import font from '../card/fontello.scss';
import Box from '../box/Box';
import Tooltip from '../tooltip/Tooltip';

export default class Card extends React.Component {
 state = {
   showInstructions: false,
   showAllRecords: false,
 };


 componentWillMount() {
   this.resetInputBoxes();
 }

  resetInputBoxes = () => {
    const newRecords = this.props.data.recordables.reduce(
      (acc, rec) => ({
        ...acc,
        [rec.label]: '',
      }),
      {},
    );
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
  }

  toggleInstructions = () =>
    this.setState({ showInstructions: !this.state.showInstructions });
  toggleCollapse = () =>
    this.setState({ showAllRecords: !this.state.showAllRecords });
  submitRecord = name => () => {
    this.props.onSubmitRecord({
      type: this.props.type,
      name,
      submission: { date: moment(), results: this.state.newRecords },
    });
    this.resetInputBoxes();
  };

  render() {
    const {
      name,
      instructions,
      recordables,
      exercises,
      parameters,
      records,
    } = this.props.data;
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
        <Box className={c.sectionWrapper} justify="end">
          <div onClick={this.submitRecord(name)} className={c.btn}>
            enter
          </div>
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
      <i onClick={this.props.onDeleteSelf} className={cs(font.iconTrashEmpty)} />
    );

    const recordsList = this.state.showAllRecords
      ? records
      : isEmpty(records) ? [] : [head(records)];
    const mostRecentWithCollapse = isEmpty(recordsList) ? [] : (
      <Box className={cs(c.recentRecord)} align="start" key={sid.generate()}>
        <Box column className={cs(c.containWidth, c.flex1)}>
          {recordsList.map((rec, i) => {
            const dateOfResult = moment(rec.date).format('DDMMMYYYY');
            const results = isEmpty(rec) ? [] : rec.results;
            return (
              <Box className={c.recordRow} key={sid.generate()}>
                {this.props.editMode && <i onClick={this.props.onDeleteRecord(i)} className={cs(font.iconTrashEmpty, font.iconTrashSmall)} />}
                <div className={c.date}>{dateOfResult}</div>
                <Box column className={cs(c.flex1)}>
                  {keys(results).map((r) => {
                    const val = results[r];
                    return (
                      <div
                        key={sid.generate()}
                        className={cs(c.containWidth, c.value, c.flex1)}
                      >
                        {`${r}: ${val}`}
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
      <div className={cs(c.container, c.card, this.props.shouldHighlight && c.workoutHighlighted)}>
        <Box justify="between">
          <div className={c.cardHeader}>{name}</div>
          {this.props.editMode && deleteWorkoutIcon}
        </Box>
        {[
          this.state.showInstructions ? mainText : null,
          instructions.length ? toggler : null,
          exerciseList,
          parameters.length ? workoutParams : null,
          inputRecords,
          mostRecentWithCollapse,
        ]}
      </div>
    );
  }
}

Card.propTypes = {
  data: PropTypes.object.isRequired,
  onSubmitRecord: PropTypes.func.isRequired,
  onDeleteSelf: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  shouldHighlight: PropTypes.bool,
};
