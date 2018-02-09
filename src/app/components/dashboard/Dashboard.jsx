import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { propEq, isNil, remove, lensPath, prepend, append, not, over } from 'ramda';
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

  updateProp = (path, functor) => this.setState(
    over(path, functor),
    () => localStorage.setItem('currentTemplate', JSON.stringify(this.state.template)),
  )

  addWorkoutResult = (catIdx, woIdx) => (submission) => {
    const workoutResults = lensPath([
      'template',
      'categories',
      catIdx,
      'workouts',
      woIdx,
      'records',
    ]);
    this.updateProp(workoutResults, prepend(submission));
  }

  addWorkoutToColumn = idx => (workout) => {
    const workouts = lensPath([
      'template',
      'categories',
      idx,
      'workouts',
    ]);
    this.updateProp(workouts, prepend(workout));
    this.updateProp(lensPath([
      'newCardOpen',
      [idx],
    ]), not);
  }

  deleteFromList = (path, i) => this.updateProp(path, remove(i, 1))

  deleteWorkout = (catIdx, woIdx) => () => this.deleteFromList(lensPath([
    'template',
    'categories',
    catIdx,
    'workouts',
  ]), woIdx);

  deleteRecord = (catIdx, woIdx) => rIdx => () => this.deleteFromList(lensPath([
    'template',
    'categories',
    catIdx,
    'workouts',
    woIdx,
    'records',
  ]), rIdx);

  handleChange = prop => ({ target: { value } }) => this.setState({ [prop]: value });

  handleHideToggle = idx => ({ target: { checked } }) => this.updateProp(lensPath(['template', 'categories', idx, 'show']), () => checked);

  changeTemplateName = ({ target: { value } }) => this.updateProp(lensPath(['template', 'templateName']), () => value);

  handleChangeColumnName = i => ({ target: { value } }) => {
    const column = lensPath([
      'template',
      'categories',
      i,
      'type',
    ]);
    this.updateProp(column, () => value);
  }

  toggleField = field => () => this.setState({ [field]: !this.state[field] })

  addColumnToTemplate = () => {
    this.updateProp(
      lensPath([
        'template',
        'categories',
      ]),
      append({
        type: this.state.newColumnName,
        show: true,
        workouts: [],
      }),
    );
    this.setState({
      newColumnName: '',
      addingColumnActive: false,
    });
  }

  removeColumnFromTemplate = i => () => this.deleteFromList(lensPath([
    'template',
    'categories',
  ]), i)

  stopProp = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  closeOnOutside = () => {
    if (this.state.showMenu) {
      this.toggleField('showMenu')();
    }
  }

  setInkbar = () => this.setState({
    inkBarStyle: {
      left: 16,
      width: ReactDOM.findDOMNode(this.firstTab).getBoundingClientRect().width,
    },
  });

  handleTabChange = i => ({ target }) => {
    this.updateProp(lensPath(['modalTab']), () => i);
    const { offsetLeft } = target;
    this.updateProp(lensPath([
      'inkBarStyle',
      'left',
    ]), () => offsetLeft);
  }

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
            onChange={this.changeTemplateName}
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
                onClick={this.removeColumnFromTemplate(i)}
                className={cs(font.iconTrashEmpty)}
              />
              <Box
                justify="end"
                className={o.actionDivider}
              ><input
                type="checkbox"
                id={`id-togg${i}`}
                checked={this.state.template.categories[i].show}
                onChange={this.handleHideToggle(i)}
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
        onClick={() => this.updateProp(lensPath(['showOptionsModal']), not)}
        className={cs(o.invisWrapper, this.state.showOptionsModal && o.active)}
      >
        {
            this.state.showOptionsModal &&
            <Slide
              timeout={225}
              in={this.state.showOptionsModal}
              key="optModal"
              classNames={s}
              onEnter={this.setInkbar}
            >
              <Modal className={s.templateOptions} key="templateOptions" onClick={this.stopProp} >
                <Box
                  className={s.tabBar}
                  justify="center"
                  content="between"
                  align="start"
                >
                  <a
                    ref={x => this.firstTab = x}
                    onClick={this.handleTabChange(1)}
                    className={cs(s.tab, this.state.modalTab === 1 && s.isActive)}
                    href="#"
                  >
                   Current
                  </a>
                  <a
                    onClick={this.handleTabChange(2)}
                    className={cs(s.tab, this.state.modalTab === 2 && s.isActive)}
                    href="#"
                  >
                    Load
                  </a>
                  <a
                    onClick={this.handleTabChange(3)}
                    className={cs(s.tab, this.state.modalTab === 3 && s.isActive)}
                    href="#"
                  >
                  New
                  </a>
                  <div className={s.inkBar} style={this.state.inkBarStyle} />
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
                  {/* <Tooltip
                    positionShift={this.state.showMenu ? 64 : null}
                    className={font.tooltipIcon}
                    el={randomizeIcon}
                    onClick={this.randomize(c.type)}
                    text="Random workout"
                  /> */}
                  <Tooltip
                    className={font.tooltipIcon}
                    positionShift={this.state.showMenu ? 64 : null}
                    el={addWorkoutIcon}
                    onClick={() => this.updateProp(lensPath([
                      'newCardOpen',
                      [i],
                    ]), not)}
                    text="Add workout"
                  />
                  <Tooltip
                    className={font.tooltipIcon}
                    positionShift={this.state.showMenu ? 64 : null}
                    el={editColumnIcon}
                    onClick={() => this.updateProp(lensPath([
                      'editMode',
                      [c.type],
                    ]), not)}
                    text={`Edit:${this.state.editMode[c.type] ? 'On' : 'Off'}`}
                  />
                </Box>
              </Box>
              <Box column className={s.workoutsContainer}>
                <TransitionGroup>
                  {this.state.newCardOpen[i] &&
                  <Slide
                    timeout={{ enter: 200, exit: 0 }}
                    classNames={s}
                    key={`newcard-${c.type}`}
                  >
                    <NewCard
                      key={sid.generate()}
                      className={s.newCardOpen}
                      onSubmit={this.addWorkoutToColumn(i)}
                      close={() => this.updateProp(lensPath(['newCardOpen', [i]]), not)}
                    />
                  </Slide>

                }
                </TransitionGroup>

                {c.workouts.length ? c.workouts.map((w, j) => (
                  <Card
                    shouldHighlight={propEq(i, true)(this.state.idxOfHighlighted)}
                    key={`card-${i}-${j}`}
                    onSubmitRecord={this.addWorkoutResult(i, j)}
                    onDeleteSelf={this.deleteWorkout(i, j)}
                    onDeleteRecord={this.deleteRecord(i, j)}
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
                      onClick={() => this.updateProp(lensPath([
                        'newCardOpen',
                        [i],
                      ]), not)}
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
