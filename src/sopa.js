import React, { Component } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { PADDING } from '../app.json';
import styles  from './styles';

var WIDTH = Dimensions.get('window').width - ( PADDING * 2 );

export default class Sopa extends Component {
	state = {
		size   : { height  : 1, width : 1 },
		letter : { fontSize : 1 },
	};

	init({ height }){
		this.setState({
			size   : { height : height, width : height },
			letter : { fontSize : height - ( PADDING * 2 ) },
		});
	}

	componentWillReceiveProps(props){
		this.init(props);
	}

	componentWillMount (){
		this.init(this.props);
	}

	item(e, x){
		return (
			<View
				key={x + '-l'}
				style={[styles.item, this.state.size ]}>
				<Text style={[styles.letter, this.state.letter]}>
					{e.toUpperCase()}
				</Text>
			</View>);
	}

	row (e, y){
		return (
			<View
				key={y + '-w'}
				style={[styles.row, { width : WIDTH }]}>
				{e.map((e, x) => this.item(e, x))}
			</View>);
	}

	render(){
		return (
			<View
				style={[styles.sopa, { width : WIDTH } ]}
				onLayout={(e) => this.props.onSize(e.nativeEvent.layout)} >
				{this.props.matrix.map((e, y) => this.row(e, y))}
			</View>);
	}
}