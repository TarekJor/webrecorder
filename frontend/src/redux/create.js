import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { reduxSearch } from 'redux-search';
import { fromJS } from 'immutable';

import createMiddleware from './middleware/clientMiddleware';


export default function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  const middleware = [createMiddleware(client), reduxRouterMiddleware];

  const searchConfig = reduxSearch({
    resourceIndexes: {
      bookmarks: ({ resources, indexDocument, state }) => {
        resources.forEach((bk) => {
          const id = bk.get('id');
          indexDocument(id, bk.get('title') || '');
          indexDocument(id, bk.get('url') || '');
        });
      }
    },
    resourceSelector: (resourceName, state) => {
      return state.app.getIn(['collection', resourceName]);
    }
  });

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { persistState } = require('redux-devtools');

    const composeEnhancer = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
                              window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
                              compose;

    finalCreateStore = composeEnhancer(
      applyMiddleware(...middleware),
      searchConfig,
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      searchConfig
    )(_createStore);
  }
  // eslint-disable-next-line global-require
  const reducer = require('./modules/reducer');


  let finalData;
  if (data) {
    finalData = Object.assign(data, { app: fromJS(data.app) });
  }
  const store = finalCreateStore(reducer, data);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      // eslint-disable-next-line global-require
      store.replaceReducer(require('./modules/reducer'));
    });
  }

  return store;
}
