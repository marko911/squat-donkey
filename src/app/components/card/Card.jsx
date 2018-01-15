import React from 'react';
import cs from 'classnames';
import c from './card.scss';

const Card = ({ data }) => {
  const {
 name, instructions, exercises, additional 
} = data;
  return (
    <div id="Card" className={cs(c.box, c.col, c.container)}>
      <div>{name}</div>
    </div>
  );
};

export default Card;
