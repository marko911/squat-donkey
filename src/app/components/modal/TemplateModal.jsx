import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import { over,
  lensPath,
  always,
  cond,
  equals } from 'ramda';
import o from './modal.scss';
import s from '../dashboard/dashboard.scss';
import t from '../input/toggle.scss';
import form from '../newCard/newCard.scss';
import font from '../card/fontello.scss';
import Modal from './Modal';
import Box from '../box/Box';
import InputWithLabel from '../input/InputWithLabel';

export default class TemplateModal extends React.Component {
  static defaultProps = {

  }
  state = {
    modalTabSelected: 1,
    saveBlankDisabled: false,
  }


  setInkbar = () => this.setState({
    inkBarStyle: {
      left: 16,
      width: ReactDOM.findDOMNode(this.firstTab).getBoundingClientRect().width,
    },
  });

  updateProp = (path, functor) => this.setState(over(path, functor))

  handleTabChange = i => ({ target }) => {
    this.updateProp(lensPath(['modalTabSelected']), always(i));
    const { offsetLeft } = target;
    this.updateProp(lensPath([
      'inkBarStyle',
      'left',
    ]), always(offsetLeft));
  }

  renderTabContent = (first, second, third) => cond([
    [equals(1), always(first)],
    [equals(2), always(second)],
    [equals(3), always(third)],
  ]);

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

  render() {
    const {
      categories,
      changeTemplateName,
      templateName,
      handleChangeColumnName,
      changeNewTemplate,
      removeColumnFromTemplate,
      handleHideToggle,
    } = this.props;
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
            value={templateName}
            onChange={changeTemplateName}
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
                onChange={handleChangeColumnName(i)}
              />
              <i
                className={cs(font.iconPencil)}
              />
            </Box>
            <Box align="center">
              <i
                onClick={removeColumnFromTemplate(i)}
                className={cs(font.iconTrashEmpty)}
              />
              <Box
                justify="end"
                className={o.actionDivider}
              ><input
                type="checkbox"
                id={`id-togg${i}`}
                checked={categories[i].show}
                onChange={handleHideToggle(i)}
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
                onChange={changeNewTemplate(['templateName'])}
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


    return (
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
      </Modal>);
  }
}
