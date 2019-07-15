import React, { Component } from 'react';
import { View, PanResponder, Animated } from 'react-native';
import { Surface, Shape, Path, Group } from 'ReactNativeART';
import { PADDING, STROKE, OPACITY } from '../app.json';
import styles from './styles';

const AnimatedShape = Animated.createAnimatedComponent(Shape);

const STROKE_D_X = 0;
const STROKE_D_Y = 0;
const TOP_BAR = 25;

const random = (max) => Math.floor(Math.random() * max );

class Line extends Component {
	static propTypes = {
		x1: React.PropTypes.number,
		y1: React.PropTypes.number,
		x2: React.PropTypes.number,
		y2: React.PropTypes.number
	};

	render () {
		var path = Path()
			.moveTo(this.props.x1, this.props.y1)
			.line(this.props.x2 - this.props.x1, this.props.y2 - this.props.y1)
			.close();
		return <AnimatedShape d={path} {...this.props} />
	}
}

export default class Touch extends Component {
	static propTypes = {
		endMove: React.PropTypes.func,
		found: React.PropTypes.array,
		x: React.PropTypes.number,
		y: React.PropTypes.number,
		height: React.PropTypes.number,
		width: React.PropTypes.number
	};

	put = { x : 0, y : 0 };
	_panResponder = {};
	state = {
		start  : { x : 0, y : 0 },
		end    : { x : 0, y : 0 },
		color  : this.runColors(),
		stroke : 1
	};

	init({ stroke }){
		this.setState({
			start  : { x : 0, y : 0 },
			end    : { x : 0, y : 0 },
			stroke : stroke - ( stroke / STROKE ),
		});
	}

	componentWillReceiveProps(props){
		this.init(props);
	}

	componentWillMount (){
		this.init(this.props);
		this._panResponder = PanResponder.create({  // Ask to be the responder:
			onStartShouldSetPanResponder: (e, g) => true,
			onStartShouldSetPanResponderCapture: (e, g) => true,
			onMoveShouldSetPanResponder: (e, g) => true,
			onMoveShouldSetPanResponderCapture: (e, g) => true,
			onPanResponderTerminationRequest: (e, g) => true,
			onPanResponderRelease: (e, g) => this.endMove(e, g),
			onPanResponderGrant: (e, g) => this.startMove(e, g),
			onPanResponderMove: (e, g) => this.onMove(e, g),
			onPanResponderTerminate: (e, g) => this.endMove(e, g),
		});
	}

	startMove(event, gesture){
		this.put = {
			x : ( gesture.x0 - this.props.x ) - ( this.state.stroke * STROKE_D_X ),
			y : ( gesture.y0 - ( this.props.y + TOP_BAR ) ) - ( this.state.stroke * STROKE_D_Y )
		};

		this.setState({
			start : this.put,
			end   : this.put,
			color : this.runColors()
		});
	}

	onMove(event, gesture){
		this.setState({ end : {
			x : this.put.x + gesture.dx - ( this.state.stroke * STROKE_D_X ),
			y : this.put.y + gesture.dy - ( this.state.stroke * STROKE_D_Y ),
		}});
	}

	endMove (event, gesture){
		this.props.endMove(this.state);
		var clear = { x : -10 * this.state.stroke, y : -10 * this.state.stroke };
		this.setState({ end : clear, start: clear });
	}

	runColors (num=256) {
		return `rgba(${random(num)},${random(num)},${random(num)},${OPACITY})`;
	}

	line(ele, k){
		return <Line
				key={k + '_word'}
				x1={ele.start.x}
				y1={ele.start.y}
				x2={ele.end.x}
				y2={ele.end.y}
				stroke={ele.color}
				strokeWidth={this.state.stroke} />
	}

	render(){
		return (
			<View
				style={styles.touch}
				{...this._panResponder.panHandlers}>
				<Surface
					height={this.props.height}
					width={this.props.width}>
					{this.line(this.state, 'init')}
					<Group>{this.props.found.map((e, k) => this.line(e, k))}</Group>
				</Surface>
			</View>);
	}
}


