import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { propEq, merge,
  keys, remove, lensPath, isEmpty,
  lensProp, prepend, map, pick,
  cond, always, equals,
  append, not, over } from 'ramda';
import form from '../newCard/newCard.scss';
import s from './dashboard.scss';
import font from '../card/fontello.scss';
import c from '../card/card.scss';
import t from '../input/toggle.scss';
import o from '../modal/modal.scss';
import h from '../header/header.scss';
import Card from '../card/Card';
import Tooltip from '../tooltip/Tooltip';
import Box from '../box/Box';
import NewCard from '../newCard/NewCard';
import Header from '../header/Header';
import Calendar from '../calendar/Calendar';
import Logo from '../icons/logo';
import TemplateIcon from '../icons/templateIcon';
import CalendarIcon from '../icons/calendarIcon';
import maximus from '../../constants/maximusBody.json';
import Modal from '../modal/Modal';
import InputWithLabel from '../input/InputWithLabel';

const stock = ['https://s3.amazonaws.com/workouttemplates/maximusBody.json'];

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
    calendarWorkouts: [],
    numColsShown: 0,
    newTemplate: {
      templateName: '',
      categories: [{ type: '', show: true, workouts: [] }],
    },
    view: 'template',
    idxOfHighlighted: {},
    newCardOpen: {},
    editMode: {},
    newColumnName: '',
    templateName: '',
    addingColumnActive: false,
    showOptionsModal: false,
    showMenu: false,
    modalTabSelected: 1,
    saveBlankDisabled: false,
    focus: {
      newTemplateName: false,
      categories: [false],
    },
    invalidFields: [],
  }

  componentWillMount() {
    this.getStockTemplates();
    let template = JSON.parse(localStorage.getItem('currentTemplate')) || {};
    const blankTemplates = JSON.parse(localStorage.getItem('blankTemplates')) || {};
    const recentTemplates = JSON.parse(localStorage.getItem('recentTemplates')) || {};

    template = !isEmpty(template) ? template : maximus;

    this.setState({
      template,
      blankTemplates,
      recentTemplates,
      stockTemplates: [],
    });
  }

  componentDidMount() {
    setTimeout(this.setShownCols, 100);
  }

  getStockTemplates = () => {
    const getStock = url => fetch(url).then(data => data.json());
    Promise
      .all(stock.map(getStock))
      .then(stockTemplates => this.setState({ stockTemplates }));
  }

  setInkbar = () => this.setState({
    inkBarStyle: {
      left: 16,
      width: ReactDOM.findDOMNode(this.firstTab).getBoundingClientRect().width,
    },
  });

  setShownCols = () => this.setState({ numColsShown: this.columns.children.length });

  // puts the latest workout at top of column
  rearrangeColumn = (catIdx, woIdx) => {
    const column = lensPath([
      'template',
      'categories',
      catIdx,
    ]);
    this.updateProp(column, (col) => {
      const newList = workouts => [workouts[woIdx], ...workouts.slice(0, woIdx), ...workouts.slice(woIdx + 1)];
      const rearranged = over(lensProp('workouts'), newList);
      return rearranged(col);
    });
  }

  createBlankTemplate = (current) => {
    const records = over(lensProp('records'), always([]));
    const workouts = over(lensProp('workouts'), map(records));
    const blankTemplate = over(lensProp('categories'), map(workouts));
    const blanks = JSON.parse(localStorage.getItem('blankTemplates')) || {};
    const blank = blankTemplate(current);
    return merge(blanks, { [blank.templateName]: blank });
  }

  updateProp = (path, functor) => this.setState(
    over(path, functor),
    () => this.updateLocalStorage(),
  )

  updateLocalStorage=() => {
    localStorage.setItem('currentTemplate', JSON.stringify(this.state.template));
    this.setState({ saveBlankDisabled: false });
  }

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
    this.rearrangeColumn(catIdx, woIdx);
    this.addToCalendar(catIdx, woIdx, submission);
  }

  addToCalendar = (catIdx, woIdx, submission) => {
    const category = this.state.template.categories[catIdx];
    const workout = pick(['exercises', 'name', 'parameters'], category.workouts[woIdx]);
    this.updateProp(lensProp('calendarWorkouts'), append({
      ...submission, type: category.type, workout, styleIdx: catIdx, template: this.state.template.templateName,
    }));
  }

  updateBlanks = () => this.setState(() => ({
    blankTemplates: this.createBlankTemplate(this.state.template),
    saveBlankDisabled: true,
  }), () => localStorage.setItem('blankTemplates', JSON.stringify(this.state.blankTemplates)))

  saveCurrentTemplate = () => {
    const recentTemplates = JSON.parse(localStorage.getItem('recentTemplates')) || {};
    const addedToRecents = merge(recentTemplates, { [this.state.template.templateName]: this.state.template });
    this.setState({ recentTemplates: addedToRecents });
    localStorage.setItem('recentTemplates', JSON.stringify(addedToRecents));
  }

  loadTemplate = template => () => {
    this.saveCurrentTemplate();
    this.updateProp(lensProp('template'), always(template));
    this.closeOptionsModal();
    this.toggleField('showMenu')();
  }

  createTemplate = () => {
    if (!this.state.newTemplate.templateName) {
      this.updateProp(lensProp('invalidFields'), append('newTemplateName'));
      return;
    }
    if (!this.state.newTemplate.categories[0].type.length) {
      const noCategory = over(lensProp(['categories']), always([]));
      this.loadTemplate(noCategory(this.state.newTemplate))();
    } else {
      this.loadTemplate(this.state.newTemplate)();
    }
    this.updateProp(lensProp('newTemplate'), always({
      templateName: '',
      categories: [{ type: '', show: true, workouts: [] }],
    }));
    this.updateProp(lensProp('focus'), always({
      newTemplateName: false,
      categories: [false],
    }));
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

  handleHideToggle = idx => ({ target: { checked } }) => {
    this.updateProp(lensPath(['template', 'categories', idx, 'show']), always(checked));
    setTimeout(this.setShownCols, 100);
  }


  changeTemplateName = ({ target: { value } }) => this.updateProp(lensPath(['template', 'templateName']), always(value));

  changeNewTemplate = path => ({ target: { value } }) => {
    this.updateProp(lensPath(['newTemplate', ...path]), always(value));
    if (path.includes('templateName')) {
      this.setState({ invalidFields: [] });
    }
  };

  handleChangeColumnName = i => ({ target: { value } }) => {
    const column = lensPath([
      'template',
      'categories',
      i,
      'type',
    ]);
    this.updateProp(column, always(value));
  }

  toggleField = field => () => this.setState({ [field]: !this.state[field] })

  addColumnToTemplate = () => {
    if (!this.state.newColumnName.length) {
      return;
    }
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


  handleTabChange = i => ({ target }) => {
    this.updateProp(lensPath(['modalTabSelected']), always(i));
    const { offsetLeft } = target;
    this.updateProp(lensPath([
      'inkBarStyle',
      'left',
    ]), always(offsetLeft));
  }

  checkForEnter = ({ charCode }) => {
    if (charCode === 13) {
      this.addColumnToTemplate();
    }
  };

  closeOptionsModal = () => {
    this.toggleField('showOptionsModal')();
    this.setState({ modalTabSelected: 1 });
  };

  addNewColumn = () => {
    this.setState({ addingColumnActive: !this.state.addingColumnActive }, () => {
      if (this.state.addingColumnActive) {
        const parent = this.dashElement.parentElement;
        const diff = this.dashContainer.offsetWidth - document.documentElement.clientWidth;
        parent.scrollLeft = diff;
      }
    });
  }

  appendColumnToNewTemplate = () => {
    this.updateProp(lensPath(['newTemplate', 'categories']), append({ type: '', show: true, workouts: [] }));
    this.updateProp(lensPath(['focus', 'categories']), append(false));
  }

  renderOptionsFooter = () => {
    const saveBlank = (
      <button
        disabled={this.state.saveBlankDisabled}
        onClick={this.updateBlanks}
        className={cs(o.btnModal, o.spaceTop, o.btnSave, this.state.saveBlankDisabled && o.btnDisabled)}
      >
        {this.state.saveBlankDisabled ? 'Saved' : 'Save Blank'}
      </button>);
    const createNew = (
      <button
        disabled={this.state.saveBlankDisabled}
        onClick={this.createTemplate}
        className={cs(o.btnModal, o.spaceTop, o.btnSave)}
      >
        Create
      </button>);
    const footerContent = cond([
      [equals(1), always(saveBlank)],
      [equals(3), always(createNew)],
    ]);
    return footerContent(this.state.modalTabSelected);
  }

  renderTabContent = (first, second, third) => cond([
    [equals(1), always(first)],
    [equals(2), always(second)],
    [equals(3), always(third)],
  ]);

  render() {
    const { categories, templateName } = this.state.template;

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
            ref={c => this.newColumnInput = c}
            className={cs(form.inputName, s.newColumnInput)}
            placeholder="Enter column name"
            value={this.state.newColumnName}
            onKeyPress={this.checkForEnter}
            onChange={this.handleChange('newColumnName')}
          />
          <div onClick={this.addColumnToTemplate} className={cs(s.btn, s.btnSecondary, s.addCol)}>
            Add
          </div>
        </Box>
      </Box>
    );

    const current = (
      <React.Fragment>
        <Box key="curre" justify="between" className={cs(o.tableHeader)}>
          <div>Name</div>
        </Box>
        <Box
          justify="between"
          align="start"
          className={s.templateModalHeader}
        >
          <input
            className={cs(o.contentMain, form.inputName)}
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
                className={cs(form.inputName, s.templateOptionsColumnInput, o.contentMain)}
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

    const load = (
      <Box
        key="load"
        column
        className={cs(o.tableHeader)}
      >

        {!isEmpty(this.state.blankTemplates) &&
        <Box column className={o.table}>
          <Box justify="between" >
            <div>My Blank Templates</div>
          </Box>

          <Box column>{keys(this.state.blankTemplates).map(name => (
            <Box
              key={name}
              justify="between"
              align="start"
              className={cs(s.loadTabItem, o.contentMain)}
            >{name}
              <div
                onClick={this.loadTemplate(this.state.blankTemplates[name])}
                className={cs(s.btn, o.btnModal, o.btnModalLoad)}
              >
              Load
              </div>
            </Box>
        ))}
          </Box>
        </Box>
        }

        <Box column className={o.table}>
          <Box justify="between" >
            <div>Stock Templates</div>
          </Box>

          <Box column>{this.state.stockTemplates.map(stock => (
            <Box
              justify="between"
              key={stock.templateName}
              align="start"
              className={cs(s.loadTabItem, o.contentMain)}
            >{stock.templateName}
              <div
                onClick={this.loadTemplate(stock)}
                className={cs(s.btn, o.btnModal, o.btnModalLoad)}
              >
              Load
              </div>
            </Box>
        ))}
          </Box>
        </Box>

        <Box column className={o.table}>
          <Box justify="between" >
            <div>My Recent Plans</div>
          </Box>

          <Box column>{keys(this.state.recentTemplates).map(recent => (
            <Box
              justify="between"
              key={recent}
              align="start"
              className={cs(s.loadTabItem, o.contentMain)}
            >{recent}
              <div
                onClick={this.loadTemplate(this.state.recentTemplates[recent])}
                className={cs(s.btn, o.btnModal, o.btnModalLoad)}
              >
              Load
              </div>
            </Box>
        ))}
          </Box>
        </Box>
      </Box>
    );

    const createNew = (
      <Box key="createnew" column className={cs(o.tableHeader)}>
        <div className={o.heading}>Create new template</div>
        <Box
          justify="between"
          align="start"
          className={cs(s.templateModalListItem, s.floatingI, o.spaceTop)}
        >
          <InputWithLabel
            key="name"
            label="Template Name"
            required
            labelClass={o.movingLabel}
            focused={this.state.focus.newTemplateName}
          >
            <Box justify="between">
              <input
                className={cs(form.inputName, o.contentMain, this.state.invalidFields.includes('newTemplateName') && form.highlightInput)}
                value={this.state.newTemplate.templateName}
                onChange={this.changeNewTemplate(['templateName'])}
                onFocus={() => (!this.state.newTemplate.templateName ? this.updateProp(lensPath(['focus', 'newTemplateName']), not) : null)}
                onBlur={() => (!this.state.newTemplate.templateName ? this.updateProp(lensPath(['focus', 'newTemplateName']), not) : null)}
              />
              <i
                className={cs(font.iconPencil)}
              />
            </Box>
          </InputWithLabel>
        </Box>
        <Box
          className={s.templateModalListItem}
          column
          id="cols"
        >
          {this.state.newTemplate.categories.map((col, i) => (
            <Box
              key={`tempcat-col${i}`}
              justify="between"
              align="start"
              className={cs(s.floatingI, s.templateModalInput)}
            >
              <InputWithLabel
                key="col"
                label={`Column ${i + 1}`}
                labelClass={o.movingLabel}
                focused={this.state.focus.categories[i]}
              >
                <Box justify="between" className={o.inputWrapper}>
                  <input
                    className={cs(form.inputName, o.contentMain)}
                    value={this.state.newTemplate.categories[i].type}
                    onChange={this.changeNewTemplate(['categories', i, 'type'])}
                    onFocus={() => (!this.state.newTemplate.categories[i].type ? this.updateProp(lensPath(['focus', 'categories', i]), not) : null)}
                    onBlur={() => (!this.state.newTemplate.categories[i].type ? this.updateProp(lensPath(['focus', 'categories', i]), not) : null)}
                  />
                  <i
                    className={cs(font.iconPencil)}
                  />
                </Box>
              </InputWithLabel>
            </Box>
        ))}
          <Box justify="end">
            <a
              onClick={this.appendColumnToNewTemplate}
              className={cs(c.toggleLink, form.add)}
            >Add
            </a>
          </Box>
        </Box>
      </Box>);

    const tabContent = this.renderTabContent(current, load, createNew);

    const TemplateOptionsModal = (
      <TransitionGroup
        onClick={this.closeOptionsModal}
        className={cs(o.invisWrapper, this.state.showOptionsModal && o.active)}
      >
        {
            this.state.showOptionsModal &&
            <Slide
              timeout={200}
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
                    className={cs(s.tab, this.state.modalTabSelected === 1 && s.isActive)}
                    href="#"
                  >
                   Current
                  </a>
                  <a
                    onClick={this.handleTabChange(2)}
                    className={cs(s.tab, this.state.modalTabSelected === 2 && s.isActive)}
                    href="#"
                  >
                    Load
                  </a>
                  <a
                    onClick={this.handleTabChange(3)}
                    className={cs(s.tab, this.state.modalTabSelected === 3 && s.isActive)}
                    href="#"
                  >
                  New
                  </a>
                  <div className={s.inkBar} style={this.state.inkBarStyle} />
                </Box>
                {tabContent(this.state.modalTabSelected)}
                <Box justify="end" className={o.spaceTop}>
                  {this.renderOptionsFooter()}
                  <button
                    onClick={this.closeOptionsModal}
                    className={cs(o.btnClose, o.spaceTop)}
                  >
                  Close
                  </button>
                </Box>

              </Modal>
            </Slide>
          }
      </TransitionGroup>);
    const columns = (
      <div
        ref={x => this.columns = x}
        className={cs(s.columns, s.flex1, this.state.numColsShown > 2 && s.spread)}
      >{categories.map((c, i) => (c.show ?
      (
        <Box key={`cat${i}`} column className={s.colWrapper}>
          <Box className={s.categoryHeader} align="center" justify="between">
            <div className={s.cardName}>{c.type}</div>
            <Box align="center">
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
              {
                  this.state.newCardOpen[i] &&
                  <Slide
                    in={this.state.newCardOpen[i]}
                    timeout={{ enter: 200, exit: 0 }}
                    classNames={s}
                    onEnter={() => log('entering')}
                    key="newcard"
                  >
                    <NewCard
                      key={`newcard${i}`}
                      className={s.newCardOpen}
                      onSubmit={this.addWorkoutToColumn(i)}
                      close={() => this.updateProp(lensPath(['newCardOpen', [i]]), not)}
                    />
                  </Slide>
                }
            </TransitionGroup>

            {c.workouts.length || this.state.newCardOpen[i] ? c.workouts.map((w, j) => (
              <Card
                shouldHighlight={propEq(i, true)(this.state.idxOfHighlighted)}
                key={`card--${j}`}
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
                  className={cs(s.btn, s.btnSecondary, s.addWorkoutBtn)}
                >
                    + Add New Workout
                </div>
              </Box>
            </Card>
        }

          </Box>
        </Box>
      ) : null))}
      </div>);
    return (
      <div
        ref={x => this.dashElement = x}
        className={cs(s.auto)}
      >
        <i
          onClick={this.toggleField('showMenu')}
          className={cs(font.iconMenu, h.iconMenu)}
        />
        <Box className={h.calendarWrap}>

          {/* <i className={cs(font.iconCalendarPlusO, h.iconCalendar)} /> */}
        </Box>
        {TemplateOptionsModal}
        <Header
          addColumn={this.addNewColumn}
          toggleOptionsModal={this.toggleField('showOptionsModal')}
          addIsActive={this.state.addingColumnActive}
          showMenu={this.state.showMenu}
        />
        <Box
          className={s.overflowWrapper}
          onClick={this.closeOnOutside}
        >
          <div
            className={cs(s.dashContainer, this.state.showMenu && s.menuOpen, s.flex1)}
          >
            <Box align="center" className={s.viewToggle}>
              {this.state.view === 'template' ?
                <CalendarIcon
                  onClick={() => this.setState({ view: 'calendar' })}
                  fill={s.colorTogglerIcons}
                />
              : <TemplateIcon
                onClick={() => this.setState({ view: 'template' })}
                fill={s.colorTogglerIcons}
              />}

              {/* <span className={s.divider} />
              <div>{templateName}</div> */}
            </Box>
            {this.state.view === 'template' ? columns : <Calendar workouts={this.state.calendarWorkouts} />
              }
            {this.state.addingColumnActive && NewColumn}

          </div>
        </Box>
      </div>

    );
  }
}


Slide.propTypes = {
  children: PropTypes.node.isRequired,
};
