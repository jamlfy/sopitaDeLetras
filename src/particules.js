import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import { Surface, Shape, Path, Group } from 'ReactNativeART';

import { COLOR, MIN_WIDTH, PADDING } from '../app.json';
import styles from './styles';

const PARTICLE_COUNT = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

const AnimatedShape = Animated.createAnimatedComponent(Shape);
const AnimatedGroup = Animated.createAnimatedComponent(Group);

const random = max => Math.floor(Math.random() * (max + 1));

function getXYParticle(total, i, radius) {
	var angle = 360 / total * i;
	return {
		x: Math.round((radius * 2) * Math.cos(angle - (Math.PI/2))),
		y: Math.round((radius * 2) * Math.sin(angle - (Math.PI/2)))
	}
}

class AnimatedCircle extends Component {
	render () {
		var radius = this.props.radius;
		var path = Path().moveTo(0, -radius)
			.arc(0, radius * 2, radius)
			.arc(0, radius * -2, radius)
			.close();
		return <AnimatedShape d={path} {...this.props} />
	}
}

export default class Particules extends Component {
	state = {
		fireworks: [],
		shots : 100
	};

	componentWillMount(){
		this.props.startAnimate( () => this._handleAddFirework() );
		if(this.props.shots){
			this.setState({ shots : this.props.shots });
		}
	}

	adjustShootingFill (_shootingColor, value) {
		Animated.timing(_shootingColor, {
			duration: 16,
			toValue: _shootingColor.__getAnimatedValue() == 0 ? 1 : 0
		}).start()
	}

	adjustParticleFill (_particleColor, value) {
		var _currentFill = _particleColor.__getAnimatedValue(),
				_particleFill = _currentFill === 5 ? 0 : _currentFill + 1;
		Animated.timing(_particleColor, {
			duration: 16,
			toValue: _particleFill
		}).start()
	}

	removeSelf (_shootingPosition) {
		this.state.fireworks = this.state.fireworks.filter(f => f.shootingPosition !== _shootingPosition);

		if(this.state.shots > 0){
			this.state.shots--;
			this._handleAddFirework();
		} else {
			this.state.shots = this.props.shots;
		}

		this.setState(this.state);
	}

	_handleAddFirework () {
		var _shootingPosition = new Animated.ValueXY({
			x: this.props.width / 2,
			y: this.props.height - PADDING
		});

		var _shootingColor = new Animated.Value(0);
		var _particleColor = new Animated.Value(0);
		var _particleRadius = new Animated.Value(0);
		var _coreOpacity = new Animated.Value(1);
		var _particlePositions = PARTICLE_COUNT.map(() => new Animated.ValueXY({x: 0, y: 0}));
		this.state.fireworks.push({
			shootingPosition: _shootingPosition,
			shootingColor: _shootingColor,
			particleColor: _particleColor,
			particleRadius: _particleRadius,
			coreOpacity: _coreOpacity,
			particlePositions: _particlePositions
		});
		var _animatedParticles = [
				Animated.timing(_particleRadius, {
					duration: 700,
					toValue: 2
				}),
				Animated.timing(_coreOpacity, {
					duration: 200,
					toValue: 0
				})
		]
		_movingParticles = _particlePositions.map((particle, i) => {
			var _xy = getXYParticle(PARTICLE_COUNT.length, i, MIN_WIDTH);
			return Animated.timing(particle, {
				duration: 250,
				toValue: _xy
			})
		})
		_animatedParticles = _animatedParticles.concat(_movingParticles);
		Animated.sequence([
			Animated.timing(_shootingPosition, {
				duration: 300,
				toValue: {
					y: random(this.props.height),
					x: random(this.props.width)
				}
			}),
			Animated.parallel(_animatedParticles)
		]).start(this.removeSelf.bind(this, _shootingPosition));
		_shootingPosition.addListener(this.adjustShootingFill.bind(null, _shootingColor));
		_particleRadius.addListener(this.adjustParticleFill.bind(null, _particleColor));
		this.setState(this.state);
	}

	getFireworks () {
		return this.state.fireworks.map((firework, i) => {
			var _shootingFill = firework.shootingColor.interpolate({
				inputRange : [0,1],
				outputRange : COLOR.SHOOTING
			});
			var _particleFill = firework.particleColor.interpolate({
				inputRange : [0,1,2,3,4],
				outputRange : COLOR.PARTICLE
			});

			return (
					<AnimatedGroup
						key={'Group:' + i }
						x={firework.shootingPosition.x}
						y={firework.shootingPosition.y}>
						<AnimatedCircle
							key={ 'Shot:' + i }
							fillOpacity={firework.coreOpacity}
							radius={PADDING}
							fill={_shootingFill}
						/>
						<Group>
							{PARTICLE_COUNT.map((v, j) => <AnimatedCircle
								key={ 'Circle:' + i  + ':' + j }
								x={firework.particlePositions[j].x}
								y={firework.particlePositions[j].y}
								radius={MIN_WIDTH}
								scaleX={firework.particleRadius}
								scaleY={firework.particleRadius}
								fill={_particleFill} />)}
						</Group>
					</AnimatedGroup>
			);
		})
	}

	render () {
		return (
		<View style={styles.touch}>
			<Surface
				width={this.props.width}
				height={this.props.height}>
				{this.getFireworks()}
			</Surface>
		</View> );
	}
}
