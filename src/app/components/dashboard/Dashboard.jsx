import React from 'react';
import cs from 'classnames';
import s from '../layout.scss';
import Card from '../card/Card';
import maximus from '../../constants/maximusBody.json';

const maximusUrl = 'https://s3.amazonaws.com/workouttemplates/maximusBody.json';
export default class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}
  render() {
    const workout = maximus.categories[0].workouts[0];
    return (
      <div className={cs(s.box)}>
        <div className={cs(s.flex1, s.dashContainer)}>
          <Card data={workout} />
        </div>
      </div>
    );
  }
}
