import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Slider from './Slider'

class SlideOut extends React.Component {
	constructor(props) {
		console.log('props :', props)
		super(props)

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
			FROM: Slider.FROM_RIGHT,
		}
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

const animateSwitch = (CustomSwitch, AnimatorComponent) => ({ updateStep, children }) => (
	<Route
		render={({ location }) => (
			<AnimatorComponent uniqKey={location.pathname} updateStep={updateStep}>
				<CustomSwitch location={location}>{children}</CustomSwitch>
			</AnimatorComponent>
		)}
	/>
)

const SwitchWithSlide = animateSwitch(Switch, SlideOut)

export default SwitchWithSlide
