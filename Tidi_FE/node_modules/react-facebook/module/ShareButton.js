import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import React from 'react';
import Share from './Share';

export default function ShareButton(props) {
  const {
    className,
    children
  } = props,
        rest = _objectWithoutProperties(props, ['className', 'children']);

  return React.createElement(
    Share,
    rest,
    ({ loading, handleClick }) => React.createElement(
      'button',
      {
        type: 'button',
        disabled: loading,
        className: className,
        onClick: handleClick
      },
      children
    )
  );
}

ShareButton.defaultProps = _extends({}, Share.defaultProps, {
  className: undefined
});
//# sourceMappingURL=ShareButton.js.map