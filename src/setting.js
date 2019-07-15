import React, { Component } from 'react';
import { Text, View, AsyncStorage, Switch, TouchableHighlight, ListView, NativeAppEventEmitter } from 'react-native';
import Slider from 'react-native-slider';
import { RevMobManager } from 'react-native-revmob';
import InAppBilling from 'react-native-billing';
import Dimensions from 'Dimensions';

import { LANG, TAG } from '../database.json';
import { MIN_WIDTH, SETTINGS, COLOR, PADDING, MIN_LETTER, OPACITY, PROS, SETTING_START, ADS, ID_NO_ADS } from '../app.json';
import styles from './styles';

const rowHasChanged = (row1, row2) => row1 !== row2;

var WIN = Dimensions.get('window');
// item
export default class Settings extends Component {
	static propTypes = {
		noADS: React.PropTypes.func,
		product: React.PropTypes.array,
	};

	state = Object.assign({
		width    : MIN_LETTER,
		listLang : new ListView.DataSource({ rowHasChanged }),
		listTag  : new ListView.DataSource({ rowHasChanged }),
		nativeLoaded : false
	}, SETTING_START);

	MAX   = Math.floor( (WIN.width / WIN.scale) / MIN_WIDTH );

	async init(prop){
		try {
			let data = await AsyncStorage.getItem(SETTINGS);
			if (data !== null && data.length){
				this.save(null, null, JSON.parse(data));
			} else {
				this.save(null, null, this.state);
			}
		} catch (error) {
			console.warn('SAVE-SETTING', error.toString());
			this.save(null, null, this.state);
		} finally {
			this.setState({
				listTag : this.state.listTag.cloneWithRows(TAG),
				listLang : this.state.listLang.cloneWithRows(LANG)
			});
		}
	}

	componentWillMount (){
		NativeAppEventEmitter.addListener('onRevmobNativeDidReceive', (e) => this.setState({ nativeLoaded: true }));
		this.init(this.props);
	}

	componentDidMount () {
        RevMobManager.startSession(ADS, (err) => err ? console.log(err) : RevMobManager.loadAdLink());
    }

    componentWillUnmount () {
        NativeAppEventEmitter.removeAllListeners();
    }

	componentWillReceiveProps(props){
		this.init(props);
	}

	calNumMax (ads) {
		return (WIN.height - (( this.props.bars || 100 ) +  15 )) / ( WIN.width - ( PADDING * 2 ));
	}

	/**
	 * Calulo matematico
	 * @param  {Number} options.x      Posicion en X
	 * @param  {Number} options.y      Posicion en Y
	 * @param  {Number} options.width  Ancho
	 * @param  {Number} options.height Alto
	 */
	calScroll ({ height }){
		this.setState({
			scroll : Math.floor(( WIN.height - ( height  + 150 ) ) / 2.25 ),
		});
	}

	/**
	 * [openSell description]
	 * @param  {String} id [description]
	 * @return {Obj}    [description]
	 */
	async openSell (id, idont, name){
		if(idont && !this.props.product.find(e => id == e)){
			this.selectNow(name, id);
		} else {
			await InAppBilling.open();
			try {

				if (!await InAppBilling.isPurchased(id)) {
					const details = await InAppBilling.purchase(id);
					console.log('You purchased: ', details);
				}

				const transactionStatus = await InAppBilling.getPurchaseTransactionDetails(id);
				console.log('Transaction Status', transactionStatus);
				const productDetails = await InAppBilling.getProductDetails(id);
				console.log(productDetails);
			}catch(e){
				console.log(e);
			} finally {
				await InAppBilling.consumePurchase(id);
				await InAppBilling.close();
			}
		}
	}

	/**
	 * Guarda la configuracion
	 * @param  {String}  name   Configuracion a guardar
	 * @param  {Any}     option Lo que sea que se quiere guardar
	 * @param  {Boolean} old    Es viejo
	 */
	save (name, option, old){
		if(name){
			let is = {};
			is[name] = option;
			this.setState(is);
		} else if(old) {
			this.setState(old);
		}

		if(name){
			this.storage();
		}
	}

	/**
	 * Guarda en la memoria del mobil
	 */
	async storage(){
		var obj = Object.assign({}, this.state);

		delete obj.listLang;
		delete obj.listTag;
		delete obj.nativeLoaded;

		try {
			await AsyncStorage.setItem(SETTINGS, JSON.stringify(obj));
		} catch (error) {
			console.error('STORAGE-SETTING', error.toString());
		}
	}

	/**
	 * Esta selecionado
	 * @param  {String}  name El nombre de la lista
	 * @param  {String}  key  El ID del elemento
	 * @return {Boolean}
	 */
	isSelect(name, key){
		return this.state[name].indexOf(key) >= 0;
	}

	/**
	 * Cambio de la selecion
	 * @param  {String}  name El nombre de la lista
	 * @param  {String}  key  El ID del elemento
	 */
	selectNow(name, key){
		this.setState(prev => {
			var w = prev[name].indexOf(key);
			if( w >= 0 ){
				prev[name].splice(w, 1);
			} else {
				prev[name].push(key);
			}

			return prev;
		}, () => this.storage());
	}

	/**
	 * Render del item para selecion
	 * @param  {String} name Nombre de la lista
	 * @param  {Object} data Datos para generar el render
	 * @return {Object}      El objecto en react
	 */
	itemRender(name, data){
		var all = [];

		if ('lang' == name ) {
			all.push(<Text
				key={data.key + '_Label'}
				onPress={() => this.openSell(data.key, true, name)} >{data.name}</Text>);
		} else {
			if(!data[ I18n.t('lang') ]){
				return null
			}

			all.push(<Text
				key={data.key + '_Label'}
				onPress={() => this.openSell(data.key, true, name)} >{data[ I18n.t('lang') ]}</Text>);
		}

		if(data.isSell && this.props.product.find(e => data.key == e)){
			all.push(<Text
				key={data.key + '_Switch'}
				onPress={() => this.openSell(data.key, true, name)}>{I18n.t('for sell')}</Text>);
		} else{
			all.push(<Switch
						key={data.key + '_Switch'}
						style={styles.switch}
						onValueChange={() => this.selectNow(name, data.key)}
						value={this.isSelect(name, data.key)} />);
		}

		return  <View style={styles.itemRender}>{all}</View>;
	}

	render(){
		return (
			<View
				style={[styles.containerSlider, styles.setting ]}>
				<View
					style={styles.settFree}
					onLayout={e => this.calScroll(e.nativeEvent.layout)}>
					<Text
						style={styles.titleBasic}>{I18n.t('setting')}</Text>
					<View
						style={styles.innerSet}>
						<View
							style={styles.titleSlider}>
							<Text
								style={styles.captionSlider}
								numberOfLines={1}>{I18n.t('ancho')}</Text>
							<Text
								style={styles.valueSlider}
								numberOfLines={1}>{this.state.width}</Text>
						</View>
						<Slider
							minimumValue={MIN_LETTER}
							maximumValue={this.MAX}
							value={this.state.width}
							step={1}
							animateTransitions={true}
							minimumTrackTintColor={COLOR.grayBlack}
							maximumTrackTintColor={COLOR.grey}
							thumbTintColor={COLOR.grayBlack}
							onValueChange={e => this.save('width', e)} />
					</View>

				</View>

				<View
					style={[ styles.innerSet, { maxHeight : this.state.scroll, height : this.state.scroll } ]}>
					<Text
						style={styles.captionSlider}
						numberOfLines={1}>{I18n.t('categoria')}</Text>
					<ListView
						style={styles.scrollerSmall}
						dataSource={this.state.listTag}
						renderRow={a => this.itemRender('tag', a) } />
				</View>

				<View
					style={[ styles.innerSet, { maxHeight : this.state.scroll, height : this.state.scroll } ]}>
					<Text
						style={styles.captionSlider}
						numberOfLines={1}>{I18n.t('idioma')}</Text>
					<ListView
						style={styles.scrollerSmall}
						dataSource={this.state.listLang}
						renderRow={a => this.itemRender('lang', a) } />
				</View>

				<View
					style={styles.innerSet}>
					<TouchableHighlight
						activeOpacity={OPACITY}
						onPress={() => this.props.noADS(ID_NO_ADS) }
						style={styles.button}>
						<Text
							style={[styles.captionSlider, styles.center]}>
							{I18n.t('compra')}
						</Text>
					</TouchableHighlight>
					{!this.state.nativeLoaded ? null :
						<TouchableHighlight
							activeOpacity={OPACITY}
							onPress={() => RevMobManager.openLoadedAdLink()}
							style={styles.button}>
							<Text
								style={[styles.captionSlider, styles.center]}>
								{I18n.t('More Apps')}
							</Text>
						</TouchableHighlight>
					}
				</View>
			</View>);
	}
}