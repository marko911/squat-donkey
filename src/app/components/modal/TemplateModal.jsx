import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import {
  over,
  lensPath,
  not,
  isEmpty,
  keys,
} from 'ramda';
import o from './modal.scss';
import s from '../dashboard/dashboard.scss';
import t from '../input/toggle.scss';
import c from '../card/card.scss';
import form from '../newCard/newCard.scss';
import font from '../card/fontello.scss';
import Modal from './Modal';
import Box from '../box/Box';
import InputWithLabel from '../input/InputWithLabel';
import { Tabs, Tab, TabPanels, TabPanel, TabList } from '../tabs/Tabs';

export const ModalFooter = ({ children, closeButton }, context) => {
  const { activeIndex } = context;
  return (
    <Box justify="end" className={o.spaceTop}>
      {[children[activeIndex], closeButton]}
    </Box>);
};

ModalFooter.contextTypes = {
  activeIndex: PropTypes.number.isRequired,
};

ModalFooter.propTypes = {
  children: PropTypes.node,
  closeButton: PropTypes.node,
};


export default class TemplateModal extends React.Component {
  static defaultProps = {};
  state = {
    focus: {
      newTemplateName: false,
      categories: [false],
    },
  };


  updateProp = (path, functor) => this.setState(over(path, functor));

  stopProp = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  render() {
    const {
      categories,
      changeTemplateName,
      templateName,
      newTemplate,
      handleChangeColumnName,
      changeNewTemplate,
      removeColumnFromTemplate,
      stockTemplates,
      handleHideToggle,
      recentTemplates,
      loadTemplate,
      appendColumnToNewTemplate,
      closeOptionsModal,
      invalidFields,
      blankTemplates,
    } = this.props;

    const current = (
      <React.Fragment>
        <Box key="curre" justify="between" className={cs(o.tableHeader)}>
          <div>Name</div>
        </Box>
        <Box justify="between" align="start" className={s.templateModalHeader}>
          <input
            className={cs(o.contentMain, form.inputName)}
            value={templateName}
            onChange={changeTemplateName}
          />
          <i className={cs(font.iconPencil)} />
        </Box>
        <Box justify="between" className={cs(o.tableHeader, o.spaceTop)}>
          <div>Column</div>
          <Box>
            Remove
            <div className={o.actionDivider}>Hide/Show</div>
          </Box>
        </Box>
        {categories.map((c, i) => (
          <Box align="center" justify="between" key={`toggler-${i}`}>
            <Box
              justify="between"
              align="start"
              className={s.templateModalListItem}
            >
              <input
                className={cs(
                  form.inputName,
                  s.templateOptionsColumnInput,
                  o.contentMain,
                )}
                placeholder="Column name"
                value={c.type}
                onChange={handleChangeColumnName(i)}
              />
              <i className={cs(font.iconPencil)} />
            </Box>
            <Box align="center">
              <i
                onClick={removeColumnFromTemplate(i)}
                className={cs(font.iconTrashEmpty)}
              />
              <Box justify="end" className={o.actionDivider}>
                <input
                  type="checkbox"
                  id={`id-togg${i}`}
                  checked={categories[i].show}
                  onChange={handleHideToggle(i)}
                  className={t.switchInput}
                />
                <label htmlFor={`id-togg${i}`} className={cs(t.switchLabel)} />
              </Box>
            </Box>
          </Box>
        ))}
      </React.Fragment>
    );

    const load = (
      <Box key="load" column className={cs(o.tableHeader)}>
        {!isEmpty(blankTemplates) && (
          <Box column className={o.table}>
            <Box justify="between">
              <div>My Blank Templates</div>
            </Box>

            <Box column>
              {keys(blankTemplates).map(name => (
                <Box
                  key={name}
                  justify="between"
                  align="start"
                  className={cs(o.loadTabItem, o.contentMain)}
                >
                  {name}
                  <div
                    onClick={loadTemplate(blankTemplates[name])}
                    className={cs(s.btn, o.btnModal, o.btnModalLoad)}
                  >
                    Load
                  </div>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box column className={o.table}>
          <Box justify="between">
            <div>Stock Templates</div>
          </Box>

          <Box column>
            {stockTemplates.map(stock => (
              <Box
                justify="between"
                key={stock.templateName}
                align="start"
                className={cs(o.loadTabItem, o.contentMain)}
              >
                {stock.templateName}
                <div
                  onClick={loadTemplate(stock)}
                  className={cs(s.btn, o.btnModal, o.btnModalLoad)}
                >
                  Load
                </div>
              </Box>
            ))}
          </Box>
        </Box>

        <Box column className={o.table}>
          <Box justify="between">
            <div>My Recent Plans</div>
          </Box>

          <Box column>
            {keys(recentTemplates).map(recent => (
              <Box
                justify="between"
                key={recent}
                align="start"
                className={cs(o.loadTabItem, o.contentMain)}
              >
                {recent}
                <div
                  onClick={loadTemplate(recentTemplates[recent])}
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
                className={cs(
                  form.inputName,
                  o.contentMain,
                  invalidFields.includes('newTemplateName') &&
                    form.highlightInput,
                )}
                value={newTemplate.templateName}
                onChange={changeNewTemplate(['templateName'])}
                onFocus={() =>
                  (!newTemplate.templateName
                    ? this.updateProp(
                        lensPath(['focus', 'newTemplateName']),
                        not,
                      )
                    : null)
                }
                onBlur={() =>
                  (!newTemplate.templateName
                    ? this.updateProp(
                        lensPath(['focus', 'newTemplateName']),
                        not,
                      )
                    : null)
                }
              />
              <i className={cs(font.iconPencil)} />
            </Box>
          </InputWithLabel>
        </Box>
        <Box className={s.templateModalListItem} column id="cols">
          {newTemplate.categories.map((col, i) => (
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
                    value={newTemplate.categories[i].type}
                    onChange={changeNewTemplate(['categories', i, 'type'])}
                    onFocus={() =>
                      (!newTemplate.categories[i].type
                        ? this.updateProp(
                            lensPath(['focus', 'categories', i]),
                            not,
                          )
                        : null)
                    }
                    onBlur={() =>
                      (!newTemplate.categories[i].type
                        ? this.updateProp(
                            lensPath(['focus', 'categories', i]),
                            not,
                          )
                        : null)
                    }
                  />
                  <i className={cs(font.iconPencil)} />
                </Box>
              </InputWithLabel>
            </Box>
          ))}
          <Box justify="end">
            <a
              onClick={appendColumnToNewTemplate}
              className={cs(c.toggleLink, form.add)}
            >
              Add
            </a>
          </Box>
        </Box>
      </Box>
    );

    const closeButton = (
      <button
        key="footerClose"
        onClick={closeOptionsModal}
        className={cs(o.btnClose, o.spaceTop)}
      >
        Close
      </button>);
    return (
      <Modal
        className={s.templateOptions}
        key="templateOptions"
        onClick={this.stopProp}
      >
        <Tabs>
          <TabList>
            <Tab> Current </Tab>
            <Tab> Load </Tab>
            <Tab> New </Tab>
          </TabList>
          <TabPanels>
            <TabPanel> {current} </TabPanel>
            <TabPanel> {load} </TabPanel>
            <TabPanel> {createNew} </TabPanel>
          </TabPanels>
          <ModalFooter closeButton={closeButton}>
            <TabPanel key="modalfooter">
              <button
                disabled={this.props.saveBlankDisabled}
                onClick={this.props.updateBlanks}
                className={cs(
                  o.btnModal,
                  o.spaceTop,
                  o.btnSave,
                  this.props.saveBlankDisabled && o.btnDisabled,
                  )}
              >
                {this.props.saveBlankDisabled ? 'Saved' : 'Save Blank'}
              </button>
            </TabPanel>

            <TabPanel key="footerPlaceholder">{null}</TabPanel>

            <TabPanel key="footerSaveBtn">
              <button
                disabled={this.props.saveBlankDisabled}
                onClick={this.props.createTemplate}
                className={cs(o.btnModal, o.spaceTop, o.btnSave)}
              >
                Create
              </button>
            </TabPanel>
          </ModalFooter>
        </Tabs>
      </Modal>
    );
  }
}

TemplateModal.propTypes = {
  categories: PropTypes.array,
  changeTemplateName: PropTypes.func.isRequired,
  templateName: PropTypes.string,
  newTemplate: PropTypes.object,
  handleChangeColumnName: PropTypes.func.isRequired,
  createTemplate: PropTypes.func.isRequired,
  changeNewTemplate: PropTypes.func.isRequired,
  removeColumnFromTemplate: PropTypes.func.isRequired,
  stockTemplates: PropTypes.array,
  handleHideToggle: PropTypes.func.isRequired,
  recentTemplates: PropTypes.object,
  loadTemplate: PropTypes.func.isRequired,
  appendColumnToNewTemplate: PropTypes.func.isRequired,
  closeOptionsModal: PropTypes.func.isRequired,
  invalidFields: PropTypes.array,
  blankTemplates: PropTypes.object,
};
