import _extends from 'babel-runtime/helpers/extends';
import React, { forwardRef, PureComponent } from 'react';
import Parser from './Parser';
import getCurrentHref from './utils/getCurrentHref';

class CommentsCount extends PureComponent {

  componentDidUpdate() {
    const { handleParse } = this.props;
    handleParse();
  }

  render() {
    const {
      href = getCurrentHref(),
      children
    } = this.props;

    return React.createElement(
      'span',
      {
        className: 'fb-comments-count',
        'data-href': href
      },
      children
    );
  }
}

CommentsCount.defaultProps = {
  href: undefined,
  children: undefined
};
export default forwardRef((props, ref) => React.createElement(
  Parser,
  null,
  ({ handleParse }) => React.createElement(CommentsCount, _extends({}, props, {
    handleParse: handleParse,
    ref: ref
  }))
));
//# sourceMappingURL=CommentsCount.js.map