
import React from 'react';

export default function circleCancel(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="1 1 21.5 21.5"
      style={{ enableBackground: 'new 0 0 24 24' }}
      xmlSpace="preserve"
      width={24}
      height={24}
      {...props}
    >
      <path d="M12,1.375C6.142,1.375,1.375,6.142,1.375,12S6.142,22.625,12,22.625S22.625,17.858,22.625,12S17.858,1.375,12,1.375z   M12,21.613c-5.301,0-9.613-4.312-9.613-9.613S6.699,2.387,12,2.387S21.613,6.699,21.613,12S17.301,21.613,12,21.613z" />
      <polygon points="15.69,7.595 12,11.285 8.31,7.595 7.595,8.31 11.285,12 7.595,15.69 8.31,16.405 12,12.715 15.69,16.405   16.405,15.69 12.715,12 16.405,8.31 " />
    </svg>
  );
}
