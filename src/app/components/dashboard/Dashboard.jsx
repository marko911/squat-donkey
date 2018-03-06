import React from 'react';
import PropTypes from 'prop-types';
import sid from 'shortid';
import cs from 'classnames';
import S3 from 'aws-sdk/clients/s3';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import {
  merge,
  remove,
  lensPath,
  isEmpty,
  lensProp,
  prepend,
  map,
  pick,
  always,
  append,
  not,
  over,
} from 'ramda';
import form from '../newCard/newCard.scss';
import s from './dashboard.scss';
import font from '../card/fontello.scss';
import o from '../modal/modal.scss';
import h from '../header/header.scss';
import Card from '../card/Card';
import Tooltip from '../tooltip/Tooltip';
import Box from '../box/Box';
import NewCard from '../newCard/NewCard';
import Calendar from '../calendar/Calendar';
import Logo from '../icons/logo';
import TemplateIcon from '../icons/templateIcon';
import CalendarIcon from '../icons/calendarIcon';
import CircleAddIcon from '../icons/circleadd';
import CircleCancelIcon from '../icons/circleCancel';
import SlidersIcon from '../icons/slidersIcon';
import maximus from '../../constants/maximusBody.json';
import TemplateModal from '../modal/TemplateModal';

const stock = ['https://s3.amazonaws.com/workouttemplates/maximusBody.json'];

const Slide = ({ children, ...props }) => (
  <CSSTransition {...props}>{children}</CSSTransition>
);

const s3 = new S3();

export default class Dashboard extends React.Component {
  state = {
    template: {},
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
    focus: {
      newTemplateName: false,
      categories: [false],
    },
    invalidFields: [],
  };

  componentWillMount() {
    this.getStockTemplates();
    let template = JSON.parse(localStorage.getItem('currentTemplate')) || {};
    const blankTemplates =
      JSON.parse(localStorage.getItem('blankTemplates')) || {};
    const recentTemplates =
      JSON.parse(localStorage.getItem('recentTemplates')) || {};
    const calendarWorkouts =
      JSON.parse(localStorage.getItem('calendarWorkouts')) || [];
    template = !isEmpty(template) ? template : maximus;

    this.setState({
      template,
      blankTemplates,
      recentTemplates,
      calendarWorkouts,
      stockTemplates: [],
    });
  }

  componentDidMount() {
    setTimeout(this.setShownCols, 100);
  }

  getStockTemplates = () => {
    const getStock = url => fetch(url).then(data => data.json());
    Promise.all(stock.map(getStock)).then(stockTemplates =>
      this.setState({ stockTemplates }));
  };


  setShownCols = () =>
    this.setState({ numColsShown: this.columns.children.length });

  saveTemplateToCloud = () => {
    const url = 'https://s3.amazonaws.com/workouttemplates/markoTemplate.json';
    const params = {
      Bucket: 'workouttemplates',
      Fields: {
        key: 'key',
      },
    };
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        console.error('Presigning post data encountered an error', err);
      } else {
        console.log('The post data is', data);
      }
    });
  }
  // puts the latest workout at top of column
  rearrangeColumn = (catIdx, woIdx) => {
    const column = lensPath(['template', 'categories', catIdx]);
    this.updateProp(column, (col) => {
      const newList = workouts => [
        workouts[woIdx],
        ...workouts.slice(0, woIdx),
        ...workouts.slice(woIdx + 1),
      ];
      const rearranged = over(lensProp('workouts'), newList);
      return rearranged(col);
    });
  };

  createBlankTemplate = (current) => {
    const records = over(lensProp('records'), always([]));
    const workouts = over(lensProp('workouts'), map(records));
    const blankTemplate = over(lensProp('categories'), map(workouts));
    const blanks = JSON.parse(localStorage.getItem('blankTemplates')) || {};
    const blank = blankTemplate(current);
    return merge(blanks, { [blank.templateName]: blank });
  };

  updateProp = (path, functor) =>
    this.setState(over(path, functor), () => this.updateLocalStorage());

  updateLocalStorage = () => {
    localStorage.setItem(
      'currentTemplate',
      JSON.stringify(this.state.template),
    );
    localStorage.setItem(
      'calendarWorkouts',
      JSON.stringify(this.state.calendarWorkouts),
    );
    this.setState({ saveBlankDisabled: false });
    log('sending');
    this.saveTemplateToCloud();
  };

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
  };

  addToCalendar = (catIdx, woIdx, submission) => {
    const category = this.state.template.categories[catIdx];
    const workout = pick(
      ['exerciseBlocks', 'name', 'recordables'],
      category.workouts[woIdx],
    );
    log('wrkout', workout);
    this.updateProp(
      lensProp('calendarWorkouts'),
      append({
        ...submission,
        type: category.type,
        workout,
        styleIdx: catIdx,
        template: this.state.template.templateName,
      }),
    );
  };

  updateBlanks = () =>
    this.setState(
      () => ({
        blankTemplates: this.createBlankTemplate(this.state.template),
        saveBlankDisabled: true,
      }),
      () =>
        localStorage.setItem(
          'blankTemplates',
          JSON.stringify(this.state.blankTemplates),
        ),
    );

  saveCurrentTemplate = () => {
    const recentTemplates =
      JSON.parse(localStorage.getItem('recentTemplates')) || {};
    const addedToRecents = merge(recentTemplates, {
      [this.state.template.templateName]: this.state.template,
    });
    this.setState({ recentTemplates: addedToRecents });
    localStorage.setItem('recentTemplates', JSON.stringify(addedToRecents));
  };

  loadTemplate = template => () => {
    this.saveCurrentTemplate();
    this.updateProp(lensProp('template'), always(template));
    this.closeOptionsModal();
    this.toggleField('showMenu')();
  };

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
    this.updateProp(
      lensProp('newTemplate'),
      always({
        templateName: '',
        categories: [{ type: '', show: true, workouts: [] }],
      }),
    );
    this.updateProp(
      lensProp('focus'),
      always({
        newTemplateName: false,
        categories: [false],
      }),
    );
  };

  addWorkoutToColumn = idx => (workout) => {
    const workouts = lensPath(['template', 'categories', idx, 'workouts']);
    this.updateProp(workouts, prepend(workout));
    this.updateProp(lensPath(['newCardOpen', [idx]]), not);
  };

  deleteFromList = (path, i) => this.updateProp(path, remove(i, 1));

  deleteWorkout = (catIdx, woIdx) => () =>
    this.deleteFromList(
      lensPath(['template', 'categories', catIdx, 'workouts']),
      woIdx,
    );

  deleteRecord = (catIdx, woIdx) => rIdx => () =>
    this.deleteFromList(
      lensPath([
        'template',
        'categories',
        catIdx,
        'workouts',
        woIdx,
        'records',
      ]),
      rIdx,
    );

  handleChange = prop => ({ target: { value } }) =>
    this.setState({ [prop]: value });

  handleHideToggle = idx => ({ target: { checked } }) => {
    this.updateProp(
      lensPath(['template', 'categories', idx, 'show']),
      always(checked),
    );
    setTimeout(this.setShownCols, 100);
  };

  changeTemplateName = ({ target: { value } }) =>
    this.updateProp(lensPath(['template', 'templateName']), always(value));

  changeNewTemplate = path => ({ target: { value } }) => {
    this.updateProp(lensPath(['newTemplate', ...path]), always(value));
    if (path.includes('templateName')) {
      this.setState({ invalidFields: [] });
    }
  };

  handleChangeColumnName = i => ({ target: { value } }) => {
    const column = lensPath(['template', 'categories', i, 'type']);
    this.updateProp(column, always(value));
  };

  toggleField = field => () => this.setState({ [field]: !this.state[field] });

  addColumnToTemplate = () => {
    if (!this.state.newColumnName.length) {
      return;
    }
    this.updateProp(
      lensPath(['template', 'categories']),
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
  };

  removeColumnFromTemplate = i => () =>
    this.deleteFromList(lensPath(['template', 'categories']), i);

  stopProp = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

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
    this.setState(
      { addingColumnActive: !this.state.addingColumnActive },
      () => {
        if (this.state.addingColumnActive) {
          const parent = this.dashElement.parentElement;
          const diff =
            this.dashContainer.offsetWidth -
            document.documentElement.clientWidth;
          parent.scrollLeft = diff;
        }
      },
    );
  };

  appendColumnToNewTemplate = () => {
    this.updateProp(
      lensPath(['newTemplate', 'categories']),
      append({ type: '', show: true, workouts: [] }),
    );
    this.updateProp(lensPath(['focus', 'categories']), append(false));
  };

  render() {
    const { categories, templateName } = this.state.template;
    const {
      newColumnName,
      numColsShown,
      editMode,
      newCardOpen,
      view,
      showOptionsModal,
      calendarWorkouts,
      addingColumnActive,
    } = this.state;
    const addWorkoutIcon = (
      <i className={cs(font.iconPlusSquared, font.iconPlusSquaredColor)} />
    );
    const editColumnIcon = (
      <i className={cs(font.iconEdit, font.iconEditColor)} />
    );
    const NewColumn = (
      <Box key="new-col-wrap" column className={s.colWrapper}>
        <Box
          className={cs(s.categoryHeader, s.newColumnBorder)}
          justify="between"
          align="center"
        >
          <input
            ref={c => (this.newColumnInput = c)}
            className={cs(form.inputName, s.newColumnInput)}
            placeholder="Enter column name"
            value={newColumnName}
            onKeyPress={this.checkForEnter}
            onChange={this.handleChange('newColumnName')}
          />
          <div
            onClick={this.addColumnToTemplate}
            className={cs(s.btn, s.btnSecondary, s.addCol)}
          >
            Add
          </div>
        </Box>
      </Box>
    );

    const TemplateOptionsModal = (
      <TransitionGroup
        onClick={this.closeOptionsModal}
        className={cs(o.invisWrapper, showOptionsModal && o.active)}
      >
        {showOptionsModal && (
          <Slide
            timeout={200}
            in={showOptionsModal}
            key="optModal"
            classNames={s}
          >
            <TemplateModal
              handleChangeColumnName={this.handleChangeColumnName}
              handleHideToggle={this.handleHideToggle}
              removeColumnFromTemplate={this.removeColumnFromTemplate}
              closeOptionsModal={this.closeOptionsModal}
              changeTemplateName={this.changeTemplateName}
              templateName={this.state.template.templateName}
              newTemplate={this.state.newTemplate}
              changeNewTemplate={this.changeNewTemplate}
              blankTemplates={this.state.blankTemplates}
              updateBlanks={this.updateBlanks}
              saveBlankDisabled={this.state.saveBlankDisabled}
              categories={categories}
              stockTemplates={this.state.stockTemplates}
              recentTemplates={this.state.recentTemplates}
              loadTemplate={this.loadTemplate}
              invalidFields={this.state.invalidFields}
              createTemplate={this.createTemplate}
              appendColumnToNewTemplate={this.appendColumnToNewTemplate}
            />
          </Slide>
        )}
      </TransitionGroup>
    );
    const columns = (
      <div
        ref={x => (this.columns = x)}
        className={cs(
          s.columns,
          s.flex1,
          numColsShown > 2 && s.spread,
        )}
      >
        {categories.map((c, i) =>
            (c.show ? (
              <Box key={`cat${i}`} column className={s.colWrapper}>
                <Box
                  className={s.categoryHeader}
                  align="center"
                  justify="between"
                >
                  <div className={s.cardName}>{c.type}</div>
                  <Box align="center">
                    <Tooltip
                      className={font.tooltipIcon}
                      el={addWorkoutIcon}
                      onClick={() =>
                        this.updateProp(lensPath(['newCardOpen', [i]]), not)
                      }
                      text="Add workout"
                    />
                    <Tooltip
                      className={font.tooltipIcon}
                      el={editColumnIcon}
                      onClick={() =>
                        this.updateProp(lensPath(['editMode', [c.type]]), not)
                      }
                      text={`Edit:${
                        editMode[c.type] ? 'On' : 'Off'
                      }`}
                    />
                  </Box>
                </Box>
                <Box column className={s.workoutsContainer}>
                  <TransitionGroup>
                    {newCardOpen[i] && (
                      <Slide
                        in={newCardOpen[i]}
                        timeout={{ enter: 200, exit: 0 }}
                        classNames={s}
                        onEnter={() => log('entering')}
                        key="newcard"
                      >
                        <NewCard
                          key={`newcard${i}`}
                          className={s.newCardOpen}
                          onSubmit={this.addWorkoutToColumn(i)}
                          close={() =>
                            this.updateProp(lensPath(['newCardOpen', [i]]), not)
                          }
                        />
                      </Slide>
                    )}
                  </TransitionGroup>

                  {c.workouts.length || newCardOpen[i] ? (
                    c.workouts.map((w, j) => (
                      <Card
                        key={`card--${j}`}
                        onSubmitRecord={this.addWorkoutResult(i, j)}
                        onDeleteSelf={this.deleteWorkout(i, j)}
                        onDeleteRecord={this.deleteRecord(i, j)}
                        data={w}
                        type={c.type}
                        editMode={!!editMode[c.type]}
                      />
                    ))
                  ) : (
                    <Card key={sid.generate()}>
                      <Box className={s.flex1} justify="center" align="center">
                        <div
                          onClick={() =>
                            this.updateProp(lensPath(['newCardOpen', [i]]), not)
                          }
                          className={cs(s.btn, s.btnSecondary, s.addWorkoutBtn)}
                        >
                          + Add New Workout
                        </div>
                      </Box>
                    </Card>
                  )}
                </Box>
              </Box>
            ) : null))}
        {addingColumnActive && NewColumn}
      </div>
    );
    return (
      <div ref={x => (this.dashElement = x)} className={cs(s.auto)}>
        {TemplateOptionsModal}
        <Box className={s.overflowWrapper} onClick={this.closeOnOutside}>
          <div
            ref={x => (this.dashContainer = x)}
            className={cs(
              s.dashContainer,
              s.flex1,
            )}
          >
            <Box align="center" justify="between" className={s.viewToggle}>
              <Box>
                <div className={s.logoContainer}>
                  <Logo fill={s.colorLogo} />
                </div>
                <span className={s.divider} />
                <div>{templateName}</div>
              </Box>
              <Box className={h.menuIcons}>
                {view === 'template' ? (
                  <Tooltip
                    el={<CalendarIcon
                      className={h.menuIcon}
                    />}
                    onClick={() => this.setState({ view: 'calendar' })}
                    text="Calendar"
                  />
              ) : (
                <Tooltip
                  el={<TemplateIcon
                    className={h.menuIcon}
                    width={24}
                    height={24}
                  />}
                  onClick={() => this.setState({ view: 'template' })}
                  text="Dashboard"
                />
              )}
                {this.state.addingColumnActive ?
                  <Tooltip
                    el={<CircleCancelIcon className={h.menuIcon} />}
                    onClick={this.addNewColumn}
                    text="Cancel"
                  /> :
                  <Tooltip
                    el={<CircleAddIcon className={h.menuIcon} />}
                    onClick={this.addNewColumn}
                    text="Add new workout"
                  />}
                <Tooltip
                  el={<SlidersIcon className={h.menuIcon} />}
                  onClick={this.toggleField('showOptionsModal')}
                  text="Template Options"
                />

              </Box>
            </Box>
            {view === 'template' ? (
              columns
            ) : (
              <Calendar workouts={calendarWorkouts} />
            )}
          </div>
        </Box>
      </div>
    );
  }
}

Slide.propTypes = {
  children: PropTypes.node.isRequired,
};
