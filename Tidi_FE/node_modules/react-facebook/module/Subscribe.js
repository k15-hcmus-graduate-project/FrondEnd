import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import React, { Component } from 'react';
import Initialize from './Initialize';

export default class LoginStatus extends Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), _initialiseProps.call(this), _temp;
  }

  componentWillUnmount() {
    const { state: { api }, props: { event } } = this;
    if (api) {
      api.unsubscribe(event, this.handleChange);
    }
  }

  render() {
    const { children } = this.props;

    return React.createElement(
      Initialize,
      { onReady: this.handleReady },
      children
    );
  }
}
LoginStatus.defaultProps = {
  onChange: undefined
};

var _initialiseProps = function () {
  var _this = this;

  this.state = {};

  this.handleReady = (() => {
    var _ref = _asyncToGenerator(function* (api) {
      const { event } = _this.props;

      _this.setState({
        api
      });

      yield api.subscribe(event, _this.handleChange);
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();

  this.handleChange = (...args) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(...args);
    }
  };
};
//# sourceMappingURL=Subscribe.js.map