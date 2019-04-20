import _extends from 'babel-runtime/helpers/extends';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import React, { Component, forwardRef } from 'react';
import Process from './Process';
import Fields from './constants/Fields';

class Login extends Component {
  constructor(...args) {
    var _temp, _this;

    return _temp = _this = super(...args), this.handleClick = (() => {
      var _ref = _asyncToGenerator(function* (evn) {
        evn.preventDefault();

        const { handleProcess, onCompleted, onError } = _this.props;

        try {
          yield handleProcess((() => {
            var _ref2 = _asyncToGenerator(function* (api) {
              const {
                scope, fields, returnScopes, rerequest, reauthorize, eventKey
              } = _this.props;
              const loginQpts = { scope };
              const authType = [];

              if (returnScopes) {
                loginQpts.return_scopes = true;
              }

              if (rerequest) {
                authType.push('rerequest');
              }

              if (reauthorize) {
                authType.push('reauthenticate');
              }

              if (authType.length) {
                loginQpts.auth_type = authType.join(',');
              }

              const response = yield api.login(loginQpts);
              if (response.status !== 'connected') {
                throw new Error('Unauthorized user');
              }

              const data = yield api.getTokenDetailWithProfile({ fields });

              if (onCompleted) {
                yield onCompleted(_extends({}, data, {
                  eventKey
                }));
              }

              return data;
            });

            return function (_x2) {
              return _ref2.apply(this, arguments);
            };
          })());
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })(), _temp;
  }

  render() {
    const {
      children, loading, error, data
    } = this.props;

    return children({
      loading,
      handleClick: this.handleClick,
      error,
      data
    });
  }
}

Login.defaultProps = {
  scope: '',
  fields: Fields,
  returnScopes: false,
  rerequest: false,
  reauthorize: false,
  onCompleted: undefined,
  onError: undefined,
  eventKey: undefined
};
export default forwardRef((props, ref) => React.createElement(
  Process,
  null,
  ({
    loading, handleProcess, data, error
  }) => React.createElement(Login, _extends({}, props, {
    loading: loading,
    handleProcess: handleProcess,
    data: data,
    error: error,
    ref: ref
  }))
));
//# sourceMappingURL=Login.js.map