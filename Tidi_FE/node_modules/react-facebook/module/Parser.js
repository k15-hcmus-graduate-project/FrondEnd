import React, { Component } from 'react';
import Initialize from './Initialize';

export default class Parser extends Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {}, this.handleReady = api => {
      this.setState({
        api
      }, this.handleParse);
    }, this.handleContainer = container => {
      this.setState({
        container
      }, this.handleParse);
    }, this.handleParse = () => {
      const { api, container } = this.state;
      if (!api || !container) {
        return;
      }

      api.parse(container);
    }, _temp;
  }

  render() {
    const { className, children } = this.props;

    return React.createElement(
      'div',
      { className: className, ref: this.handleContainer },
      React.createElement(
        Initialize,
        { onReady: this.handleReady },
        children({
          handleParse: this.handleParse
        })
      )
    );
  }
}
Parser.defaultProps = {
  className: undefined
};
//# sourceMappingURL=Parser.js.map