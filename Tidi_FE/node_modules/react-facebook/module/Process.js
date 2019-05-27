import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import React, { Component } from 'react';
import Initialize from './Initialize';

export default class Process extends Component {
  constructor(...args) {
    var _temp, _this;

    return _temp = _this = super(...args), this.state = {
      api: undefined
    }, this.handleProcess = (() => {
      var _ref = _asyncToGenerator(function* (fn) {
        _this.setState({
          data: undefined,
          error: undefined,
          loading: true
        });

        try {
          const { api } = _this.state;
          if (!api) {
            throw new Error('Facebook is not initialized. Wait for isReady');
          }

          const data = yield fn(api);

          _this.setState({
            data,
            loading: false
          });

          return data;
        } catch (error) {
          _this.setState({
            error,
            loading: false
          });

          throw error;
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })(), this.handleReady = api => {
      this.setState({
        api
      });
    }, _temp;
  }

  render() {
    const { children } = this.props;
    const {
      api, loading, data, error
    } = this.state;

    return React.createElement(
      Initialize,
      { onReady: this.handleReady },
      children({
        loading: !api || loading,
        handleProcess: this.handleProcess,
        data,
        error
      })
    );
  }
}
//# sourceMappingURL=Process.js.map