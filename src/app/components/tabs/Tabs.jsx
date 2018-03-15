import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import s from './tabs.scss';

export class Tabs extends Component {
  static childContextTypes = {
    activeIndex: PropTypes.number.isRequired,
    onSelectTab: PropTypes.func.isRequired,
  }

  state = {
    activeIndex: 0,
  };


  getChildContext() {
    return {
      activeIndex: this.state.activeIndex,
      onSelectTab: this.selectTabIndex,
    };
  }

  componentWillMount() {
    if (this.props.activeIndex) {
      this.setState({ activeIndex: this.props.activeIndex });
    }
  }

  selectTabIndex= (activeIndex) => {
    this.setState({ activeIndex });
  }

  render() {
    const children = React.Children.map(this.props.children, child =>
      React.cloneElement(child, {
        activeIndex: this.state.activeIndex,
        onSelectTab: this.selectTabIndex,
      }));
    return <div className={s.tabs}>{children}</div>;
  }
}


export class TabList extends Component {
  state={
    inkBarStyle: {
      left: 16,
    },
  }

  componentDidMount() {
    this.setInkbarStyle();
  }

  setInkbarStyle = () => this.setState({
    inkBarStyle: {
      left: this.container.children[this.context.activeIndex].offsetLeft,
      width: this.container.children[0].getBoundingClientRect().width,
    },
  })

  updateInkbar = index => this.setState({
    inkBarStyle: {
      ...this.state.inkBarStyle,
      left: this.container.children[index].offsetLeft,
    },
  })


  render() {
    const {
      activeIndex, onSelectTab,
    } = this.context;
    const children = React.Children.map(this.props.children, (child, index) => React.cloneElement(
      child,
      {
        isActive: index === activeIndex,
        onSelect: () => { onSelectTab(index); this.updateInkbar(index); },
      },
    ));

    return (
      <div
        ref={x => this.container = x}
        className={s.tabBar}
        justify="center"
        content="between"
        align="start"
      >
        {children}
        <div className={s.inkBar} style={this.state.inkBarStyle} />
      </div>);
  }
}

TabList.contextTypes = {
  activeIndex: PropTypes.number.isRequired,
  onSelectTab: PropTypes.func.isRequired,
};

export const Tab = ({
  children, isActive, onSelect, disabled,
}) => (
  <div
    className={cs(s.tab, isActive && s.isActive, disabled && s.disabled)}
    onClick={disabled ? null : onSelect}
  >{children}
  </div>
);


export const TabPanels = ({ children }, context) => {
  const { activeIndex } = context;
  return (
    <div className={s.panels}>
      {children[activeIndex]}
    </div>);
};

TabPanels.contextTypes = {
  activeIndex: PropTypes.number.isRequired,
};

export const TabPanel = ({ children }) => children;
