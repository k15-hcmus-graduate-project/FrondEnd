import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';

let getLoginStatus = (() => {
  var _ref = _asyncToGenerator(function* (api) {
    const response = yield api.getLoginStatus();

    return response.status;
  });

  return function getLoginStatus(_x) {
    return _ref.apply(this, arguments);
  };
})();

import React, { Component } from 'react';
import Initialize from './Initialize';
import Subscribe from './Subscribe';

export default class Status extends Component {
  constructor(...args) {
    var _temp, _this;

    return _temp = _this = super(...args), this.state = {
      loading: true
    }, this.handleReady = (() => {
      var _ref2 = _asyncToGenerator(function* (api) {
        _this.setState({
          status: yield getLoginStatus(api),
          loading: false
        });
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })(), this.handleStatusChange = response => {
      this.setState({
        status: response.status,
        loading: false
      });
    }, _temp;
  }

  render() {
    const { children } = this.props;
    const { status, loading } = this.state;

    return React.createElement(
      Initialize,
      { onReady: this.handleReady },
      React.createElement(
        Subscribe,
        { event: 'auth.statusChange', onChange: this.handleStatusChange },
        children({
          status,
          loading
        })
      )
    );
  }
}
//# sourceMappingURL=Status.js.map