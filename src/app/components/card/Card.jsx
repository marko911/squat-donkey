import React from 'react';
import cs from 'classnames';
import sid from 'shortid';
import { isEmpty, head, keys, values } from 'ramda';
import PropTypes from 'prop-types';
import moment from 'moment';
import c from './card.scss';
import Box from '../box/Box';

export default class Card extends React.Component {
  constructor() {
    super();
    this.state = {
      showInstructions: false,
      showAllRecords: false,
    };
  }

  componentWillMount() {
    this.resetInputBoxes();
  }


  resetInputBoxes = () => {
    const newRecords = this.props.data.instructions.recordables.reduce(
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

  toggleInstructions = () =>
    this.setState({ showInstructions: !this.state.showInstructions });
  toggleCollapse = () =>
    this.setState({ showAllRecords: !this.state.showAllRecords });
  submitRecord = name => (e) => {
    e.preventDefault();
    const recordHasValues = values(this.state.newRecords).reduce(
      (acc, nxt) => acc || !isEmpty(nxt),
      false,
    );
    if (recordHasValues) {
      this.props.onSubmitRecord({
        type: this.props.type,
        name,
        submission: { date: moment(), results: this.state.newRecords },
      });
    }
    this.resetInputBoxes();
  };

  render() {
    const {
      name,
      instructions: {
        recordables, exercises, main, additional,
      },
      records,
    } = this.props.data;
    const toggler = (
      <a
        key={sid.generate()}
        className={c.toggleLink}
        onClick={this.toggleInstructions}
      >
        {this.state.showInstructions
          ? 'Hide instructions'
          : 'Show instructions'}
      </a>
    );

    const mainText = (
      <div key={sid.generate()} className={c.instructions}>
        {main}
      </div>
    );

    const exerciseList = (
      <Box key={sid.generate()} column>
        {exercises.map(e => (
          <Box className={c.exercises} justified="between" key={sid.generate()}>
            <div className={c.label}>{e.label}</div>
            <div className={c.value}>{e.value}</div>
          </Box>
        ))}
      </Box>
    );

    const workoutParams = (
      <div key={sid.generate()} className={cs(c.sectionWrapper, c.border)}>
        {additional.map(p => <div key={sid.generate()}>{p}</div>)}
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
    const recordsList = this.state.showAllRecords
      ? records
      : isEmpty(records) ? [] : [head(records)];
    const mostRecentWithCollapse = isEmpty(recordsList) ? [] : (
      <Box className={cs(c.recentRecord)} align="start" key={sid.generate()}>
        <Box column className={c.flex1}>
          {recordsList.map((rec) => {
            const dateOfResult = moment(rec.date).format('DD-MMM-YYYY');
            const results = isEmpty(rec) ? [] : rec.results;
            return (
              <Box className={c.recordRow} key={sid.generate()}>
                <div className={c.date}>{dateOfResult}</div>
                <Box
                  className={cs(c.exerciseContainer)}
                  key={sid.generate()}
                  column
                >
                  {keys(results).map((r) => {
                    const val = results[r];
                    return (
                      <Box
                        key={sid.generate()}
                        justify="between"
                        align="center"
                      >
                        {`${r}: ${val}`}
                      </Box>
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
        <div className={c.cardHeader}>{name}</div>
        {[
          this.state.showInstructions ? mainText : null,
          toggler,
          exerciseList,
          workoutParams,
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
};
