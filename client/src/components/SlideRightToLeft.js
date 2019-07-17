import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Slider from './Slider'

class SlideOut extends React.Component {
	constructor(props) {
		super(props)
		console.log('props :', props)

		this.state = {
			childPosition: Slider.CENTER,
			curChild: props.children,
			curUniqId: props.uniqId,
			prevChild: null,
			prevUniqId: null,
			animationCallback: null,
		}

		this.optionsAnimation = {
			TO: Slider.TO_LEFT,
			FROM: Slider.CENTER,
		}

		/*

		this.optionsAnimation = {
			TO: Slider.TO_LEFT,
			FROM: Slider.FROM_RIGHT,
		}
        */
	}

	componentDidUpdate(prevProps, prevState) {
		const prevUniqId = prevProps.uniqKey || prevProps.children.type
		const uniqId = this.props.uniqKey || this.props.children.type

		if (prevUniqId !== uniqId) {
			this.setState({
				childPosition: this.optionsAnimation.TO,
				curChild: this.props.children,
				curUniqId: uniqId,
				prevChild: prevProps.children,
				prevUniqId,
				animationCallback: this.swapChildren,
			})
		}
	}

	swapChildren = () => {
		this.setState({
			childPosition: this.optionsAnimation.FROM,
			prevChild: null,
			prevUniqId: null,
			animationCallback: null,
		})
	}

	render() {
		return (
			<Slider
				position={this.state.childPosition}
				animationCallback={this.state.animationCallback}
			>
				{this.state.prevChild || this.state.curChild}
			</Slider>
		)
	}
}

const animateSwitch = (CustomSwitch, AnimatorComponent) => {
	return ({ updateStep, children }) => {
		return (
			<Route
				render={({ location }) => {
					return (
						<AnimatorComponent uniqKey={location.pathname} updateStep={updateStep}>
							<CustomSwitch location={location}>{children}</CustomSwitch>
						</AnimatorComponent>
					)
				}}
			/>
		)
	}
}

function SwitchWithSlide(props) {
	console.log('SwitchWithSlide :', props)

	return animateSwitch(Switch, SlideOut)
}

export default SwitchWithSlide()
