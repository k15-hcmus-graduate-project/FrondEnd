import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import React, { Component, createContext } from 'react';
import canUseDOM from 'can-use-dom';
import FB from './Facebook';

export const FacebookContext = createContext();
let api = null;

export default class Facebook extends Component {
  constructor(...args) {
    var _temp, _this;

    return _temp = _this = super(...args), this.state = {
      isReady: false
    }, this.handleInit = _asyncToGenerator(function* () {
      // do not run if SSR
      if (!canUseDOM) {
        throw new Error('You can not use Facebook without DOM');
      }

      const { isReady } = _this.state;
      if (isReady) {
        return api;
      }

      if (!api) {
        const {
          domain,
          version,
          appId,
          cookie,
          status,
          xfbml,
          language,
          frictionlessRequests,
          wait
        } = _this.props;

        api = new FB({
          domain,
          appId,
          version,
          cookie,
          status,
          xfbml,
          language,
          frictionlessRequests,
          wait
        });
      }

      yield api.init();

      if (!_this.state.isReady) {
        _this.setState({
          isReady: true
        });
      }

      return api;
    }), _temp;
  }

  componentDidMount() {
    const { wait } = this.props;
    if (!wait) {
      this.handleInit();
    }
  }

  render() {
    const { children } = this.props;
    const { isReady, error } = this.state;
    const { handleInit } = this;

    const value = {
      isReady,
      error,
      handleInit,
      api
    };

    return React.createElement(
      FacebookContext.Provider,
      { value: value },
      children
    );
  }
}
Facebook.defaultProps = {
  version: 'v3.1',
  cookie: false,
  status: false,
  xfbml: false,
  language: 'en_US',
  frictionlessRequests: false,
  domain: 'connect.facebook.net',
  children: undefined,
  wait: false
};
//# sourceMappingURL=FacebookProvider.js.map