import React from 'react'
import './App.css'

import Routes from 'routes'

const style = {
	fontFamily: 'Roboto,Helvetica Neue,Arial,Sans-serif',
	fontSize: 'small',
	lineHeight: '1.33',
}

function App() {
	return (
		<div className="App" style={style}>
			{Routes()}
		</div>
	)
}

export default App
