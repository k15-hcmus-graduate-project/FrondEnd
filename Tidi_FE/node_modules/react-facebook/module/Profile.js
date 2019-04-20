import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import React, { Component } from 'react';
import Initialize from './Initialize';
import Subscribe from './Subscribe';
import Fields from './constants/Fields';
import LoginStatus from './constants/LoginStatus';

export default class Profile extends Component {
  constructor(...args) {
    var _temp, _this;

    return _temp = _this = super(...args), this.state = {
      loading: true
    }, this.handleReady = (() => {
      var _ref = _asyncToGenerator(function* (api) {
        _this.api = api;

        _this.updateProfile();
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })(), this.handleStatusChange = () => {
      this.updateProfile();
    }, _temp;
  }

  updateProfile() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const { api, props: { fields } } = _this2;
      if (!api) {
        return;
      }

      try {
        const response = yield api.getLoginStatus();
        if (response.status !== LoginStatus.CONNECTED) {
          _this2.setState({
            profile: undefined,
            loading: false,
            error: undefined
          });

          return;
        }

        const profile = yield api.getProfile({
          fields
        });

        _this2.setState({
          profile,
          loading: false,
          error: undefined
        });
      } catch (error) {
        _this2.setState({
          profile: undefined,
          loading: false,
          error
        });
      }
    })();
  }

  render() {
    const { children } = this.props;
    const { profile, loading, error } = this.state;

    return React.createElement(
      Initialize,
      { onReady: this.handleReady },
      React.createElement(
        Subscribe,
        { event: 'auth.statusChange', onChange: this.handleStatusChange },
        children({
          profile,
          loading,
          error
        })
      )
    );
  }
}
Profile.defaultProps = {
  fields: Fields
};
//# sourceMappingURL=Profile.js.map