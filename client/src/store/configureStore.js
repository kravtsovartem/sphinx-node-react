import { createBrowserHistory } from 'history'
import { applyMiddleware, compose, createStore } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import * as ReduxObservable from 'redux-observable'

import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/mapTo'

import createRootReducer, { rootEpic } from './reducers'

const { createEpicMiddleware } = ReduxObservable
const epicMiddleware = createEpicMiddleware()

export const history = createBrowserHistory()

export default function configureStore(preloadedState) {
	const store = createStore(
		createRootReducer(history),
		preloadedState,
		compose(applyMiddleware(routerMiddleware(history), epicMiddleware)),
	)
	epicMiddleware.run(rootEpic)
	return store
}
