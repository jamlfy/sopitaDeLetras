import { StyleSheet, Dimensions } from 'react-native';
import { PADDING, COLOR, BAR_HEIGTH } from '../app.json';

var WIN = Dimensions.get('window');
// setting
export var bottomADS = WIN.width >= 468;

export default StyleSheet.create({
	paddings : {
		paddingTop : PADDING,
		paddingLeft : PADDING * 2,
		alignItems: 'center',
		paddingRight : PADDING * 10,
	},
	game : {
		margin : PADDING,
		overflow : 'hidden',
		position : 'relative',
		marginBottom : 100,
	},
	sopa : {
		zIndex :  0,
		borderTopColor : COLOR.grayBlack,
		borderTopWidth : 1,
		borderLeftColor : COLOR.grayBlack,
		borderLeftWidth : 1,
		alignItems: 'center',
	},
	row : {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		padding : 0
	},
	item : {
		borderBottomColor : COLOR.grayBlack,
		borderBottomWidth : 1,
		borderRightColor : COLOR.grayBlack,
		borderRightWidth : 1,
		alignItems: 'center',
		flexDirection: 'column',
		flex : 1
	},

	letter : {
		textAlign : 'center',
		backgroundColor : 'transparent',
		borderRightColor : COLOR.black,
	},

	touch : {
		position : 'absolute',
		zIndex : 100
	},
	vis : {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

	},
	titleBasic : {
		fontSize : 22,
		paddingBottom : 5,
	},
	titleSlider : {
		flexDirection: 'row',
    	justifyContent: 'space-between',
		alignItems: 'center',
	},
	titleMenu : {
		backgroundColor : 'white',
		color : COLOR.grayBlack
	},
	captionSlider : {
		color : COLOR.grayBlack,
		fontWeight : 'bold'
	},
	valueSlider: {
		flex: 1,
		textAlign: 'right',
		marginLeft: 10
	},
	containerSlider : {
		padding: 7,
		backgroundColor : COLOR.principal,
		justifyContent : 'flex-start',
		alignItems : 'stretch',
		flex : 1
	},
	innerSet : {
		paddingTop : 10,
	},
	all : {
		paddingTop: 25,
		flex : 1,
		flexDirection : 'column',
		flexWrap: 'wrap',
		backgroundColor : COLOR.principal,
		position: 'relative'
	},
	scroller : {
		height : WIN.height - 50 ,
	},
	scrollerSmall : {
		marginTop : 5,
		marginBottom : 5,
	},
	bar : {
		flex: 1,
		maxWidth : WIN.width,
		maxHeight : 100,
		resizeMode: 'stretch',
		position: 'absolute',
		bottom: 0,
		right: 0,
		left: 0,
	},
	barInner : {
		paddingTop : 25,
	},
	foundWord : {
		textDecorationLine : 'line-through',
		color : COLOR.grey,
		fontWeight : 'bold'
	},
	buttonPress : {
		borderColor : COLOR.grayBlack,
		backgroundColor : COLOR.principal,
	},
	button : {
		padding : PADDING,
		borderColor : COLOR.grey,
		borderWidth : PADDING / 3,
		borderRadius : PADDING * 10,
		backgroundColor : 'white',
		marginTop : 5
	},
	nuevo : {
		justifyContent: 'center',
		minHeight : 37,
	},
	center : {
		textAlign : 'center'
	},
	switch: {
		right : 0,
		position : 'absolute',
		top : 7
	},
	itemRender : {
		padding : 10,
		position : 'relative'
	},
	banner : {
		paddingTop : 50
	},
	settFree : {
		borderBottomWidth: 1,
		borderBottomColor: COLOR.grey,
		paddingBottom : PADDING * 2,
	},
	setting : {
		paddingTop : 25,
		flexDirection : 'column',
		justifyContent: 'space-between',
	},
	texzt : {
		fontSize : PADDING * 6
	},
	biggerGame : {
		flex: 1,
		justifyContent : 'center',
		alignItems : 'center'
	},
	cover : {
		width : WIN.width,
		height : WIN.height,
		alignItems : 'center',
		justifyContent : 'center',
	}
});