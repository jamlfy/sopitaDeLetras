import React, { Component } from 'react';
import { Text, Image, TouchableHighlight, Alert, View, Dimensions } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';

import { OPACITY, CLICKS, TIMER, ADS } from '../app.json';
import styles, { bottomADS } from './styles';

export default class Bar extends Component {
	static propTypes = {
		word: React.PropTypes.func,
		newGame: React.PropTypes.func,
		setting: React.PropTypes.func,
		isADS: React.PropTypes.bool,
	};

	times  = 0;
	_timer = null;
	state  = {
		pressA : false,
		pressB : false,
		pressC : false,
		show   : 0,
	};

	clean (){
		if(this._timer){
			clearTimeout(this._timer);
		}

		this.timer = null;
		this.setState({ show : 0 });
	}

	toStart(){
		this.times++;
		if(this._timer){
			this.setState({ show : this.state.show + 1 });
			if(this.state.show == CLICKS){
				this.clean();
				// RUN
				Alert.alert(I18n.t('name'), I18n.t('creditos'));
			}
		} else {
			this.clean();
			this._timer = setTimeout(() => this.clean(), TIMER);
			if(this.props.newGame){
				this.props.newGame();
			}
		}
	}

	_onUnderlay(a, e){
		let i = {};
		i[ 'press' + a ] = e;

		this.setState(i);
	}

	render(){
		return (<Image
					style={styles.bar}
					source={require('../image/paper.png')}
					renderToHardwareTextureAndroid={true}>
					<Grid style={styles.barInner}>
						<Col>
							<Row style={styles.nuevo}>
								<TouchableHighlight
									activeOpacity={OPACITY}
									onPress={() => this.props.setting()}
									onHideUnderlay={() => this._onUnderlay('A', false)}
									onShowUnderlay={() => this._onUnderlay('A', true)}
									style={[styles.button, this.state.pressA ? styles.buttonPress : {}]}>
									<Text style={[styles.captionSlider]}>{I18n.t('setting')}</Text>
								</TouchableHighlight>
							</Row>
							<Row style={styles.nuevo}>
								<TouchableHighlight
									activeOpacity={OPACITY}
									onPress={() => this.props.word()}
									onHideUnderlay={() => this._onUnderlay('B', false)}
									onShowUnderlay={() => this._onUnderlay('B', true)}
									style={[styles.button, this.state.pressB ? styles.buttonPress : {}]}>
									<Text style={[styles.captionSlider]}>{I18n.t('palabra')}</Text>
								</TouchableHighlight>
							</Row>
						</Col>
						<Col style={styles.vis}>
							<TouchableHighlight
								activeOpacity={OPACITY}
								onPress={() => this.toStart()}
								onHideUnderlay={() => this._onUnderlay('C', false)}
								onShowUnderlay={() => this._onUnderlay('C', true)}
								style={[styles.button, { borderColor : 'transparent' }, this.state.pressC ? styles.buttonPress : {}]}>
								<Text style={[styles.captionSlider, styles.texzt, { fontSize : this.state.bars / 5 }]}>
									{I18n.t('nuevo')}
								</Text>
							</TouchableHighlight>
						</Col>
					</Grid>
				</Image>);
	}
}