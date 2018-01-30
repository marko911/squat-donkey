import React from 'react';
import PropTypes from 'prop-types';

const TemplateIcon = ({ width = '32', height = '32', fill = '#000' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={fill} x="0px" y="0px" viewBox="0 0 100 125" enableBackground="new 0 0 100 100" xmlSpace="preserve"><path d="M86.17,16.17H13.83c-1.38,0-2.5,1.12-2.5,2.5v9.66c0,1.38,1.12,2.5,2.5,2.5h72.34c1.38,0,2.5-1.12,2.5-2.5v-9.66  C88.67,17.291,87.55,16.17,86.17,16.17z M83.67,25.831H16.33v-4.66h67.34V25.831z" /><path d="M43.16,36.17H13.83c-1.38,0-2.5,1.12-2.5,2.5v15.77c0,1.38,1.12,2.5,2.5,2.5h29.33c1.38,0,2.5-1.12,2.5-2.5V38.67  C45.66,37.291,44.54,36.17,43.16,36.17z M40.66,51.94H16.33V41.17h24.33V51.94z" /><path d="M43.16,63.061H13.83c-1.38,0-2.5,1.119-2.5,2.5v15.77c0,1.381,1.12,2.5,2.5,2.5h29.33c1.38,0,2.5-1.119,2.5-2.5v-15.77  C45.66,64.18,44.54,63.061,43.16,63.061z M40.66,78.83H16.33v-10.77h24.33V78.83z" /><path d="M86.17,36.17H54.49c-1.38,0-2.5,1.12-2.5,2.5v42.66c0,1.381,1.12,2.5,2.5,2.5h31.68c1.38,0,2.5-1.119,2.5-2.5V38.67  C88.67,37.291,87.55,36.17,86.17,36.17z M83.67,78.83H56.99V41.17h26.68V78.83z" /></svg>
);

export default TemplateIcon;

TemplateIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

