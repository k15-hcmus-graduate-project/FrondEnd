import _extends from 'babel-runtime/helpers/extends';
import React, { PureComponent, forwardRef } from 'react';
import Parser from './Parser';

class MessengerCheckbox extends PureComponent {

  componentDidUpdate() {
    const { handleParse } = this.props;
    handleParse();
  }

  render() {
    const {
      origin,
      prechecked,
      allowLogin,
      userRef,
      messengerAppId,
      pageId,
      children,
      size,
      centerAlign,
      skin
    } = this.props;

    return React.createElement(
      'div',
      {
        className: 'fb-messenger-checkbox',
        messenger_app_id: messengerAppId,
        page_id: pageId,
        size: size,
        origin: origin,
        user_ref: userRef,
        prechecked: prechecked,
        allow_login: allowLogin,
        skin: skin,
        center_align: centerAlign
      },
      children
    );
  }
}

MessengerCheckbox.defaultProps = {
  size: undefined,
  allowLogin: undefined,
  prechecked: undefined,
  userRef: undefined,
  children: undefined,
  origin: undefined,
  skin: undefined,
  centerAlign: undefined
};
export default forwardRef((props, ref) => React.createElement(
  Parser,
  null,
  ({ handleParse }) => React.createElement(MessengerCheckbox, _extends({}, props, {
    handleParse: handleParse,
    ref: ref
  }))
));
//# sourceMappingURL=MessengerCheckbox.js.map