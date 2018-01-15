import React from 'react';
import cs from 'classnames';
import c from './card.scss';

const Card = ({ data }) => {
  const {
 name, instructions, exercises, additional 
} = data;
  return (
    <div id="Card" className={cs(c.box, c.col, c.container, c.name)}>
      <div>
        Our data is delivered to you on-demand using well-documented and simple
        HTTP RESTful API in JSON, XML or CSV formats.
      </div>
    </div>
  );
};

export default Card;
