import { React } from 'react';

import './InformationBoard.css';

export const InformationBoard = ({ children }) => {
  return (
    <div className="information-board">{children}</div>
  )
}

InformationBoard.propTypes = {
  children: function (props, propName, componentName) {
    const prop = props[propName];
    let error = null;

    React.Children.forEach(prop, child => {
      if (child.type !== InformationSection) {
        error = new Error('`' + componentName + '` children should be of type `InformationSectin`.');
      }
    });

    return error
  }
}

export const InformationSection = ({ children }) => {
  return (
    <div className="information-section">{children}</div>
  )
}

const typographyMapper = {
  'header': { tag: 'h4', class: 'header' },
  'text': { tag: 'p', class: 'text'},
  'meta': { tag: 'span', class: 'meta' }
}

export const InformationTypography = ({ type, sign, highlight, children }) => {
  const typoghraphy = typographyMapper[type] || typographyMapper.text;
  const Tag = typoghraphy.tag;
  const className = typoghraphy.class;


  return (
    <Tag className={`information-typography ${className} ${sign} ${highlight ? 'highlight' : ''}`}>{children}</Tag>
  )
}

InformationTypography.defaultProps = {
  type: 'text',
  sign: '',
  highlight: false,
  children: null
}
