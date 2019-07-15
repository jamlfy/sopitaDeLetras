import React, { Component } from 'react';
import { Text, View, ListView } from 'react-native';

import styles from './styles';

export default class Words extends Component {
	static propTypes = {
		words: React.PropTypes.array
	};

	state = {
		data : new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
	};

	init({ words }){
		this.setState({ data : this.state.data.cloneWithRows(words) });
	}

	componentDidMount(){
		this.init(this.props);
	}

	componentWillReceiveProps(props) {
		this.init(props)
	}

	header(){
		return <Text style={styles.titleBasic}>{I18n.t('palabra')}</Text>;
	}

	words(item){
		return (
			<Text style={ styles[ item.start ? 'foundWord' : 'captionSlider'] } >
				{ (item.start ? item.name : item).toUpperCase() }
			</Text> );
	}

	render(){
		return (
			<View style={[styles.containerSlider, styles.setting ]}>
				<ListView
					style={styles.itemRender}
					renderHeader={this.header}
					dataSource={this.state.data}
					renderRow={rowData => this.words(rowData)} />
			</View>);
	}

}