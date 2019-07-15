import React, { Component } from 'react';
import { View, ActivityIndicator, StatusBar, Image, AsyncStorage, Dimensions, NativeAppEventEmitter } from 'react-native';
import { RevMobManager } from 'react-native-revmob';
import InAppBilling from 'react-native-billing';
import Drawer from 'react-native-drawer';

import { WORDS, MATRIX, COLOR, ADS, PADDING, ID_NO_ADS} from '../app.json';
import styles from './styles';

import Setting from './setting';
import Word from './word';
import Game from './game';
import Bar from './bar';
import Gen from './generator';

var WIN = Dimensions.get('window');

export default class sopitaDeLetras extends Component {
	WIDTH = ( WIN.width - ( PADDING * 2 ) ) / 2;

	generator   = new Gen(global.db);
	openSetting = null;
	openWords   = null;
	isStart     = false;
	dateNow     = new Date();

	state = {
		matrix  : [ [ 'a' , 'b'], [ 'a' , 'b'] ],
		words   : [ 'ab' ],
		loading : true,
		showADS : false
	};

	componentDidMount(){
		this.init(this.props);
	}

	componentWillMount(){
		NativeAppEventEmitter.addListener('onRevmobBannerDidReceive', () => RevMobManager.showBanner());
		NativeAppEventEmitter.addListener('onRevmobBannerDidDisplay', () => this.setState({ showADS: true }));
	}

	componentWillUnmount () {
		NativeAppEventEmitter.removeAllListeners();
	}

	async init (props) {
		var matrix;
		var words;
		try {
			matrix = JSON.parse(await AsyncStorage.getItem(MATRIX));
			words = JSON.parse(await AsyncStorage.getItem(WORDS));
			await InAppBilling.open();
			this.isProducts = await InAppBilling.listOwnedProducts();
			await InAppBilling.close();
		} catch (e) {
			console.log('start', e);
		} finally {
			await this.newGame(matrix, words);
		}
	}

	async newGame (m, w){
		var start = !m || !m.length || !w || !w.length;
		this.setState({ loading : true });

		try {
			matrix = m;
			words = w;

			if(start){
				let mx = await this.createMatrix();
				matrix = mx.matrix;
				words = mx.words;

				await AsyncStorage.setItem(WORDS, JSON.stringify(words));
				await AsyncStorage.setItem(MATRIX, JSON.stringify(matrix));
			}
		} catch(e){
			console.log('NewGame', e);
		} finally{
			if(!this.state.showADS && !this.isStart){
				RevMobManager.startSession(ADS, (e) => this.bannerError(e));
				this.isStart = true;
			}

			this.setState({ matrix, words, loading : false });
		}
	}

	async createMatrix (){
		try {
			let mx = await this.generator.init();
			if(!mx.words || !mx.words.length){
				throw new Error('No words');
			}

			return mx;
		} catch(e){
			console.log('generator', e);
			return this.createMatrix();
		}
	}

	pushWords (words){
		var now = new Date()
		this.setState({ words });

		this.dateNow = now;
		AsyncStorage.setItem(WORDS, JSON.stringify(words));
	}

	bannerError(error){
		if(error){
			console.error('BANNER', error.toString());
		} else {
			if(this.isStart){
				RevMobManager.loadBanner();
			}
		}
	}

	opens(name){
		this['open' + name ].open();
	}

	__render () {
		if(!(this.openWords && this.openSetting) || this.state.loading){
			return ( <Image
						style={[styles.all, styles.cover]}
						source={require('../image/loading.png')}>
					<ActivityIndicator
						color={COLOR.grayBlack}
						size='large' />
				</Image> );
		}

		return (<View style={styles.all}>
					<View style={styles.biggerGame} >
						<Game
							putWords={words => this.pushWords(words)}
							matrix={this.state.matrix}
							words={this.state.words}
							newGame={() => this.newGame()} />
					</View>
					<Bar
						isADS={this.state.loadADS}
						word={() => this.opens('Words')}
						setting={() => this.opens('Setting')}
						newGame={() => this.newGame()} />
				</View> );
	}

	render(){
		return (
				<View
					renderToHardwareTextureAndroid={true}
					style={{flex:1, marginBottom : this.state.showADS ? 55 : 0 }}>
					<Drawer
						type='static'
						tweenEasing='easeInOutQuad'
						ref={r => this.openSetting = r}
						tapToClose={true}
						openDrawerOffset={this.WIDTH}
						tweenHandler={Drawer.tweenPresets.parallax}
						side='left'
						content={ <Setting noADS={e => RevMobManager.hideBanner()} products={this.isProducts} /> }>
						<StatusBar
							backgroundColor={COLOR.bar}
							barStyle='light-content'
							translucent={true}
							animated={true}
							hidden={false} />
						<Drawer
							type='static'
							tweenEasing='easeInOutQuad'
							ref={r => this.openWords = r}
							tapToClose={true}
							openDrawerOffset={this.WIDTH}
							tweenHandler={Drawer.tweenPresets.parallax}
							side='left'
							content={ <Word lower={this.state.lower} words={this.state.words} /> } >
							{this.__render()}
						</Drawer>
					</Drawer>
				</View>);
	}
}