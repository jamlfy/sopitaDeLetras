import React, { Component } from 'react';
import { View, Dimensions, Alert, NativeAppEventEmitter } from 'react-native';
import { RevMobManager } from 'react-native-revmob';
import Share from 'react-native-share';
import _ from 'underscore';

import { PADDING, MIN_LETTER, TIMER, SHOTS, REG_EX, ADS } from '../app.json';
import styles from './styles';

import Touch from './touch';
import Sopa from './sopa';
import Particules from './particules';

function clone (obj) {
	var type = typeof obj;
	if (!(type === 'function' || type === 'object' && !!obj) ) return obj;
	return toString.call(obj) === '[object Array]' ?
			obj.slice() : Object.assign({}, obj);
}

export default class Inter extends Component {
	static propTypes = {
		matrix: React.PropTypes.array,
		words: React.PropTypes.array,
		putWords: React.PropTypes.func,
		newGame: React.PropTypes.func
	};

	animeWin;
	moreApps = {
		text: I18n.t('Share'),
		onPress: () => Share.open({
			title: "React Native",
			message: "Hola mundo",
			subject: "Share Link" //  for email
		})
	};

	win      = Dimensions.get('window');
	game     = this.win.width - (PADDING * 2);
	state    = {
		heightCell : 1,
		divisorX : 1,
		divisorY : 1,
		height : 2,
		width  : 2,
		x      : 0,
		y      : 0
	};

	init({ matrix }){
		this.isWin({});
		this.setState( {
			heightCell : (this.game - (matrix.length * 2)) / matrix[0].length,
		});
	}

	componentWillMount (){
		this.init(this.props);
		NativeAppEventEmitter.addListener('onRevmobNativeDidReceive', (e) => this.moreApp = {
			text: I18n.t('More Apps'),
			onPress: RevMobManager.openLoadedAdLink
		});
	}

	componentWillReceiveProps(props){
		RevMobManager.startSession(ADS, (err) => err ? console.log(err) : RevMobManager.loadAdLink());
		this.init(props);
	}

	componentWillUnmount () {
		NativeAppEventEmitter.removeAllListeners();
	}

	/**
	 * Puts the numer
	 * @param  {Boolean} is
	 * @param  {Number} options.x
	 * @param  {Number} options.y
	 * @param  {Number} options.width
	 * @param  {Number} options.height
	 */
	putNumbers(is, {x, y, width, height}){
		if(is){
			this.setState({
				divisorX : width / this.props.matrix[0].length,
				divisorY : height / this.props.matrix.length,
				heightCell : (this.game - (this.props.matrix.length * 2)) / this.props.matrix[0].length,
				width,
				height,
			});
		} else {
			this.setState({ x, y });
		}
	}

	/**
	 * [isWin description]
	 * @param  {Boolean} testing
	 * @param  {Object}  options.start
	 * @param  {Object}  options.end
	 * @param  {Object}  options.color
	 * @param  {Array}   options.word
	 * @return {Boolean}
	 */
	isWin ({ start, end, color, word }, testing=false) {
		var winner = true;
		var isNew = false;
		var words = [];

		for (var i = 0; i < this.props.words.length; i++) {
			if(_.isString(this.props.words[i]) && testing){
				var plops = this.props.words[i].replace(REG_EX, '').toLowerCase();
				if(plops === word[0] || plops === word[1]){
					isNew = true;
					words[i] = { color, start, end,
						name : this.props.words[i]
					};
				} else{
					words[i] = clone(this.props.words[i]);
				}
			} else {
				words[i] = clone(this.props.words[i]);
			}

			winner = !!(winner && words[i].start);
		}

		if(isNew){
			this.props.putWords(words);
		}

		if(winner && this.animeWin){
			this.animeWin();
			setTimeout(() => Alert.alert(I18n.t('gando'), I18n.t('winner'), [ {
				text: I18n.t('volver'),
				onPress: this.props.newGame
			}, this.moreApps ]), TIMER * 7);
		}
	}

	/**
	 * [endMove description]
	 * @param  {Object} options.start
	 * @param  {Object} options.end
	 * @param  {String} options.color
	 */
	endMove ({ start, end, color }) {
		var crd = {
			start : {
				x : Math.abs(Math.floor(start.x / this.state.divisorX )),
				y : Math.abs(Math.floor(start.y / this.state.divisorY ))
			},
			end : {
				x : Math.abs(Math.floor(end.x / this.state.divisorX )),
				y : Math.abs(Math.floor(end.y / this.state.divisorY ))
			},
			isWord : false
		};

		[ 'end', 'start' ].forEach((e, index) => {
			if( crd[e].x > this.props.matrix[0].length ){
				crd[e].x = this.props.matrix[0].length - 1;
			}

			if(crd[e].y > this.props.matrix.length){
				crd[e].x = this.props.matrix.length - 1;
			}

			if( crd[e].x < 0 ){
				crd[e].x = 0;
			}

			if(crd[e].y < 0){
				crd[e].x = 0;
			}
		});

		if( crd.start.x === crd.end.x ){
			let bigs = Math.max( crd.end.y, crd.start.y);
			let small = Math.min( crd.start.y, crd.end.y );
			crd.isWord = [];

			for (let i = bigs; i >= small
					&& i >= 0
					&& i < this.props.matrix.length ; i--) {
				if(this.props.matrix[i] && this.props.matrix[i][crd.start.x]){
					crd.isWord.push(this.props.matrix[i][crd.start.x]);
				}
			}

		} else if ( crd.start.y === crd.end.y ) {
			let bigs = Math.max( crd.end.x, crd.start.x);
			let small = Math.min( crd.start.x, crd.end.x );
			crd.isWord = [];

			for (let i = bigs ; i >= small
					&& i >= 0
					&& i < this.props.matrix[0].length ; i--) {
				if(this.props.matrix[crd.start.y] && this.props.matrix[crd.start.y][i]){
					crd.isWord.push(this.props.matrix[crd.start.y][i]);
				}
			}

		} else if (Math.abs(crd.end.y - crd.start.y) === Math.abs(crd.start.x - crd.end.x)){

			var difX = crd.start.x - crd.end.x;
			var difY = crd.start.y - crd.end.y;

			difX += Math.sign(difX) * -1;
			difY += Math.sign(difY) * -1;

			var x = crd.start.x;
			var y = crd.start.y;

			var letters = Math.abs(crd.end.x - crd.start.x);

			crd.isWord = [];

			for (let i = 0; i <= letters
					&& x >= 0 && y >= 0
					&& x < this.props.matrix[0].length
					&& y < this.props.matrix.length; i++) {
				crd.isWord.push(this.props.matrix[y][x]);
				x += Math.sign(difX) * -1;
				y += Math.sign(difY) * -1;
			}
		}

		if(crd.isWord && crd.isWord.length >= MIN_LETTER ){
			var isWord = crd.isWord.join('').toLowerCase().split('');
			this.isWin({ start, end, color,
				word : [ isWord.join('') , isWord.reverse().join('') ]
			}, !!crd.isWord);
		}
	}

	render(){
		return <View
					style={styles.game}
					renderToHardwareTextureAndroid={true}
					onLayout={e => this.putNumbers(false, e.nativeEvent.layout)}>
					<Particules
						startAnimate={e => this.animeWin = e }
						shots={_.random(SHOTS / 2, SHOTS * 4)}
						height={this.state.height}
						width={this.state.width} />
					<Touch
						x={this.state.x}
						y={this.state.y}
						height={this.state.height}
						width={this.state.width}
						found={this.props.words.filter(e => e && e.start && e.color)}
						stroke={this.state.heightCell}
						endMove={data => this.endMove(data)} />
					<Sopa
						onSize={size => this.putNumbers(true, size)}
						lower={this.props.lower}
						matrix={this.props.matrix}
						height={this.state.heightCell} />
				</View>
	}
}