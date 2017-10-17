import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import { DropdownButton } from 'react-bootstrap';

import { remoteBrowserMod } from 'helpers/utils';
import { RemoteBrowserOption } from 'components/controls';

import 'shared/scss/dropdown.scss';


class RemoteBrowserSelect extends Component {

  static propTypes = {
    accessed: PropTypes.number,
    active: PropTypes.bool,
    activeBrowser: PropTypes.string,
    browsers: PropTypes.object,
    getBrowsers: PropTypes.func,
    loading: PropTypes.bool,
    loaded: PropTypes.bool,
    params: PropTypes.object,
    selectRemoteBrowser: PropTypes.func,
    selectedBrowser: PropTypes.string,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  static contextTypes = {
    router: PropTypes.object,
    currMode: PropTypes.string
  };

  static defaultProps = {
    active: false
  };

  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  getRemoteBrowsers = () => {
    // load remote browsers if we don't already have them or
    // it's been 15min since last retrieval
    if (!this.props.browsers || !this.props.accessed || Date.now() - this.props.accessed > 15 * 60 * 1000) {
      this.props.getBrowsers();
    }

    this.setState({ open: !this.state.open });
  }

  selectBrowser = (id) => {
    const { active, params, timestamp, url } = this.props;
    const { currMode } = this.context;

    this.setState({ open: false });

    if (active) {
      const { user, coll, rec } = params;

      if (currMode.indexOf('replay') !== -1) {
        this.context.router.push(`/${user}/${coll}/${remoteBrowserMod(id, timestamp)}/${url}`);
      } else if (['patch', 'record'].includes(currMode)) {
        this.context.router.push(`/${user}/${coll}/${rec}/${remoteBrowserMod(id)}/${url}`);
      } else if (['extract', 'extract_only'].includes(currMode)) {
        // TODO: extract route
      }
    } else {
      this.props.selectRemoteBrowser(id);
    }
  }

  render() {
    const { active, activeBrowser, browsers, loading, loaded, selectedBrowser } = this.props;
    const { open } = this.state;

    // if this in an active instance of the widget (on replay/record interface) use activeBrowser prop
    // otherwise use the selected browser from the ui.
    const instanceContext = active ? activeBrowser : selectedBrowser;

    const activeBrowserEle = browsers ? browsers.find(b => b.get('id') === instanceContext) : null;

    const btn = activeBrowserEle ?
      <span className="btn-content">
        <img src={`/api/browsers/browsers/${activeBrowserEle.get('id')}/icon`} alt="Browser Icon" />{ ` ${activeBrowserEle.get('name')} v${activeBrowserEle.get('version')}` }
      </span> :
      <span className="btn-content">(native) <span className="hidden-sm hidden-xs">Current</span></span>;

    return (
      <DropdownButton
        id="cnt-button"
        title={btn}
        bsStyle="default"
        open={open}
        onToggle={this.getRemoteBrowsers}>
        <div className="container">
          <ul className="row">
            <li className="col-xs-2"><h6 className="dropdown-header">browser</h6></li>
            <li className="col-xs-2"><h6 className="dropdown-header">version</h6></li>
            <li className="col-xs-2"><h6 className="dropdown-header">release</h6></li>
            <li className="col-xs-2"><h6 className="dropdown-header">OS</h6></li>
            <li className="col-xs-4"><h6 className="dropdown-header">capabilities</h6></li>
          </ul>
          { loading &&
            <div>loading options..</div>
          }
          { loaded && browsers &&
              browsers.valueSeq().map(browser => <RemoteBrowserOption browser={browser} key={browser.get('id') ? browser.get('id') : 'native'} selectBrowser={this.selectBrowser} isActive={instanceContext === browser.get('id')} />)
          }
          {
            <RemoteBrowserOption browser={fromJS({ id: null, name: '(native) Current' })} selectBrowser={this.selectBrowser} isActive={instanceContext === null} />
          }
        </div>
      </DropdownButton>
    );
  }
}

export default RemoteBrowserSelect;
