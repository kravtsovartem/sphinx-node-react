import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import configureStore, { history } from 'store/configureStore'
import App from './App'
import * as serviceWorker from './serviceWorker'
import 'babel-polyfill'

const store = configureStore()

ReactDOM.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</Provider>,
	document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register()
