import React from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { find, findIndex, propEq, without, isNil, isEmpty } from 'ramda';
import form from '../newCard/newCard.scss';
import s from './dashboard.scss';
import font from '../card/fontello.scss';
import t from '../input/toggle.scss';
import o from '../modal/modal.scss';
import h from '../header/header.scss';
import Card from '../card/Card';
import Tooltip from '../tooltip/Tooltip';
import Box from '../box/Box';
import NewCard from '../newCard/NewCard';
import Header from '../header/Header';
import maximus from '../../constants/maximusBody.json';
import Modal from '../modal/Modal';

// const maximusUrl = 'https://s3.amazonaws.com/workouttemplates/maximusBody.json';
const Slide = ({ children, ...props }) => (
  <CSSTransition
    {...props}
  >
    {children}
  </CSSTransition>
);


export default class Dashboard extends React.Component {
  state = {
    template: {},
    idxOfHighlighted: {},
    newCardOpen: {},
    editMode: {},
    newColumnName: '',
    templateName: '',
    addingColumnActive: false,
    showOptionsModal: false,
    showMenu: false,
    modalTab: 1,
  }

  componentWillMount() {
    const storedTemplate = JSON.parse(localStorage.getItem('currentTemplate'));
    const template = !isNil(storedTemplate) ? storedTemplate : maximus;
    this.setState({
      template,
    });
  }

  getCategoryAndIdx = type => ({
    data: find(propEq('type', type), this.state.template.categories),
    idx: findIndex(
      propEq('type', type),
      this.state.template.categories,
    ),
  })

  updateCurrentTemplate = (template) => {
    this.setState(state => ({
      ...state,
      template,
    }));
    localStorage.setItem('currentTemplate', JSON.stringify(template));
  }

  randomize = type => () => {
    const { data, idx } = this.getCategoryAndIdx(type);
    const randIdx = Math.round(Math.random() * (data.workouts.length - 1));
    const selected = data.workouts[randIdx];
    const reorderedList = without([selected], data.workouts);
    reorderedList.unshift(selected);
    const updatedTemplate = { ...this.state.template };
    updatedTemplate.categories[idx].workouts = reorderedList;
    this.updateCurrentTemplate(updatedTemplate);
    // border highlighting
    this.setState(state => ({
      ...state,
      idxOfHighlighted: { 0: true },
    }));
    setTimeout(() => {
      this.setState(state => ({
        ...state,
        idxOfHighlighted: {},
      }));
    }, 1000);
  };

  addWorkoutResult = ({ name, type, submission }) => {
    const updatedTemplate = { ...this.state.template };
    const { data, idx } = this.getCategoryAndIdx(type);
    const workout = find(propEq('name', name), data.workouts);
    workout.records.unshift(submission);
    const workoutIdx = findIndex(
      propEq('name', name),
      data.workouts,
    );
    updatedTemplate.categories[idx].workouts[
      workoutIdx
    ] = workout;
    this.updateCurrentTemplate(updatedTemplate);
  }

  addWorkoutToColumn = type => (workout) => {
    const { data, idx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    data.workouts.unshift(workout);
    template.categories[idx] = data;
    this.updateCurrentTemplate(template);
    this.toggleColumnState(type, 'newCardOpen')();
  }

  deleteWorkout = (type, idx) => () => {
    const { data, idx: idxCategory } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    const workoutToDelete = data.workouts[idx];
    const restOfWorkouts = without([workoutToDelete], data.workouts);
    template.categories[idxCategory].workouts = restOfWorkouts;
    this.updateCurrentTemplate(template);
  }

  deleteRecord = (type, idx) => rIdx => () => {
    const { data, idx: catIdx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    const workout = data.workouts[idx];
    const recordToDel = workout.records[rIdx];
    template.categories[catIdx].workouts[idx].records = without([recordToDel], workout.records);
    this.updateCurrentTemplate(template);
  }

  toggleColumnState =(type, prop) => () => this.setState({
    [prop]: {
      ...this.state[prop],
      [type]: !this.state[prop][type],
    },
  })

  handleChange = prop => ({ target: { value } }) => this.setState({ [prop]: value });


  handleHideToggle = type => ({ target: { checked } }) => {
    const { idx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    template.categories[idx].show = checked;
    this.updateCurrentTemplate(template);
  }

  handleChangeTemplate = ({ target: { value } }) => {
    const template = { ...this.state.template };
    template.templateName = value;
    this.updateCurrentTemplate(template);
  }

  handleChangeColumnName = i => ({ target: { value } }) => {
    const template = { ...this.state.template };
    template.categories[i].type = value;
    this.updateCurrentTemplate(template);
  }

  toggleField = field => () => this.setState({ [field]: !this.state[field] })

  addColumnToTemplate = () => {
    const template = { ...this.state.template };
    template.categories.push({
      type: this.state.newColumnName,
      show: true,
      workouts: [],
    });
    this.updateCurrentTemplate(template);
    this.setState({
      newColumnName: '',
      addingColumnActive: false,
    });
  }

  removeColumnFromTemplate = type => () => {
    const { idx } = this.getCategoryAndIdx(type);
    const template = { ...this.state.template };
    template.categories = without([template.categories[idx]], template.categories);
    this.updateCurrentTemplate(template);
  }

  stopProp = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }
  closeOnOutside = () => {
    if (this.state.showMenu) {
      this.toggleField('showMenu')();
    }
  }
  setModalTab = tab => () => this.setState({ modalTab: tab })

  render() {
    const { categories } = this.state.template;
    const randomizeIcon = (
      <i className={cs(font.iconShuffle, font.iconShuffleColor)} />
    );
    const addWorkoutIcon = (
      <i className={cs(font.iconPlusSquared, font.iconPlusSquaredColor)} />
    );
    const editColumnIcon = (
      <i className={cs(font.iconEdit, font.iconEditColor)} />
    );
    const NewColumn = (
      <Box key="new-col-wrap" column className={s.colWrapper}>
        <Box className={s.categoryHeader} justify="between" align="center">
          <input
            className={cs(form.inputName, s.newColumnInput)}
            placeholder="Enter column name"
            value={this.state.newColumnName}
            onChange={this.handleChange('newColumnName')}
          />
          <div onClick={this.addColumnToTemplate} className={cs(s.btn, s.addCol)}>
            Add
          </div>
        </Box>
      </Box>
    );

    const current = (
      <React.Fragment>
        <Box justify="between" className={cs(o.tableHeader)}>
          <div>Name</div>
        </Box>
        <Box
          justify="between"
          align="start"
          className={s.templateModalHeader}
        >
          <input
            className={cs(form.inputName)}
            value={this.state.template.templateName}
            onChange={this.handleChangeTemplate}
          />
          <i
            className={cs(font.iconPencil)}
          />
        </Box>
        <Box justify="between" className={cs(o.tableHeader, o.spaceTop)}>
          <div>Column</div>
          <Box>
      Remove
            <div className={o.actionDivider}>Hide/Show</div>
          </Box>
        </Box>
        {categories.map((c, i) => (
          <Box
            align="center"
            justify="between"
            key={`toggler-${i}`}
          >
            <Box
              justify="between"
              align="start"
              className={s.templateModalListItem}
            >
              <input
                className={cs(form.inputName, s.templateOptionsColumnInput)}
                placeholder="Column name"
                value={c.type}
                onChange={this.handleChangeColumnName(i)}
              />
              <i
                className={cs(font.iconPencil)}
              />
            </Box>
            <Box align="center">
              <i
                onClick={this.removeColumnFromTemplate(c.type)}
                className={cs(font.iconTrashEmpty)}
              />
              <Box
                justify="end"
                className={o.actionDivider}
              ><input
                type="checkbox"
                id={`id-togg${i}`}
                checked={this.state.template.categories[i].show}
                onChange={this.handleHideToggle(c.type)}
                className={t.switchInput}
              />
                <label
                  htmlFor={`id-togg${i}`}
                  className={cs(t.switchLabel)}
                />
              </Box>
            </Box>
          </Box>))}
      </React.Fragment>);


    const TemplateOptionsModal = (
      <TransitionGroup
        onClick={this.toggleField('showOptionsModal')}
        className={cs(o.invisWrapper, this.state.showOptionsModal && o.active)}
      >
        {
            this.state.showOptionsModal &&
            <Slide
              timeout={225}
              in={this.state.showOptionsModal}
              key="optModal"
              classNames={s}
            >
              <Modal className={s.templateOptions} key="templateOptions" onClick={this.stopProp} >
                <Box
                  className={s.tabBar}
                  justify="center"
                  content="between"
                  align="start"
                >
                  <a
                    onClick={this.setModalTab(1)}
                    className={cs(s.tab, this.state.modalTab === 1 && s.isActive)}
                    href="#"
                  >
                   Current
                  </a>
                  <a
                    onClick={this.setModalTab(2)}
                    className={cs(s.tab, this.state.modalTab === 2 && s.isActive)}
                    href="#"
                  >
                    Load
                  </a>
                  <a
                    onClick={this.setModalTab(3)}
                    className={cs(s.tab, this.state.modalTab === 3 && s.isActive)}
                    href="#"
                  >
                  New
                  </a>
                </Box>
                {current}
                <Box justify="end">
                  <div
                    onClick={this.toggleField('showOptionsModal')}
                    className={cs(o.btnClose, o.spaceTop)}
                  >
                  Close
                  </div>
                </Box>

              </Modal>
            </Slide>
          }
      </TransitionGroup>);

    return (
      <div className={cs(s.auto)} >
        <i
          onClick={this.toggleField('showMenu')}
          className={cs(font.iconMenu, h.iconMenu)}
        />
        {TemplateOptionsModal}
        <Header
          addColumn={this.toggleField('addingColumnActive')}
          toggleOptionsModal={this.toggleField('showOptionsModal')}
          addIsActive={this.state.addingColumnActive}
          showMenu={this.state.showMenu}
        />
        <Box
          onClick={this.closeOnOutside}
          className={cs(s.dashContainer, this.state.showMenu && s.menuOpen)}
        >
          {categories.map((c, i) => (c.show ?
          (
            <Box key={`cat-${i}`} column className={s.colWrapper}>
              <Box className={s.categoryHeader} align="center" justify="between">
                <div className={s.cardName}>{c.type}</div>
                <Box align="center">
                  <Tooltip
                    positionShift={this.state.showMenu ? 64 : null}
                    className={font.tooltipIcon}
                    el={randomizeIcon}
                    onClick={this.randomize(c.type)}
                    text="Random workout"
                  />
                  <Tooltip
                    className={font.tooltipIcon}
                    positionShift={this.state.showMenu ? 64 : null}
                    el={addWorkoutIcon}
                    onClick={this.toggleColumnState(c.type, 'newCardOpen')}
                    text="Add workout"
                  />
                  <Tooltip
                    className={font.tooltipIcon}
                    positionShift={this.state.showMenu ? 64 : null}
                    el={editColumnIcon}
                    onClick={this.toggleColumnState(c.type, 'editMode')}
                    text={`Edit:${this.state.editMode[c.type] ? 'On' : 'Off'}`}
                  />
                </Box>
              </Box>
              <Box column className={s.workoutsContainer}>
                <TransitionGroup>
                  {this.state.newCardOpen[c.type] &&
                  <Slide
                    timeout={{ enter: 200, exit: 0 }}
                    classNames={s}
                    key={`newcard-${c.type}`}
                  >
                    <NewCard
                      key={sid.generate()}
                      className={s.newCardOpen}
                      onSubmit={this.addWorkoutToColumn(c.type)}
                      close={this.toggleColumnState(c.type, 'newCardOpen')}
                    />
                  </Slide>

                }
                </TransitionGroup>

                {c.workouts.length ? c.workouts.map((w, j) => (
                  <Card
                    shouldHighlight={propEq(i, true)(this.state.idxOfHighlighted)}
                    key={`card-${i}-${j}`}
                    onSubmitRecord={this.addWorkoutResult}
                    onDeleteSelf={this.deleteWorkout(c.type, j)}
                    onDeleteRecord={this.deleteRecord(c.type, j)}
                    data={w}
                    type={c.type}
                    editMode={!!this.state.editMode[c.type]}
                  />
              )) :
                <Card key={sid.generate()}>
                  <Box
                    className={s.flex1}
                    justify="center"
                    align="center"
                  >
                    <div
                      onClick={this.toggleColumnState(c.type, 'newCardOpen')}
                      className={cs(s.btn, s.addWorkoutBtn)}
                    >
                  + Add New Workout
                    </div>
                  </Box>


                </Card>
            }

              </Box>
            </Box>
      ) : null))}
          {this.state.addingColumnActive && NewColumn}

        </Box>
      </div>

    );
  }
}

Dashboard.propTypes = {
  template: PropTypes.object,
};

Slide.propTypes = {
  children: PropTypes.node.isRequired,
};
