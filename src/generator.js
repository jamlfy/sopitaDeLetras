import { AsyncStorage } from 'react-native';
import _ from 'underscore';

import { WORD } from '../database.json';
import { SETTINGS, SETTING_START, FREE, REG_EX, MIN_LETTER, LIST_WORDS, MIN_WORDS} from '../app.json';

const NO_CHAR = new RegExp(REG_EX, 'gim');
const KEY = 'name';
// w
function clone (matrix) {
	var nm = new Array(matrix.length - 1);
	for (var i = 0; i < matrix.length; i++) {
		nm[i] = _.clone(matrix[i]);
	}

	return nm;
}

export default class Gen {
	LETTERS = _.shuffle('qwertyuioplkjhgfdsazxcvbnm'.split(''));
	setting = _.clone(SETTING_START);

	/**
	 * Base de datos en Firebase
	 * @param  {Object} db Firebase
	 */
	/**
	 * Base de datos en Firebase
	 * @param  {Object} db Firebase
	 */
	constructor(db) {
		this.setting.lang = [ I18n.t('lang') ];
		this.getWordsDB(db.database().ref().child('word'));
	}

	/**
	 * Obtener palabras
	 * @param  {Object} snap El snap de firebase
	 */
	getWordsDB (ref){
		var list = [];
		ref.on('value', snap => {
			list = [];

			snap.forEach(child => {
				list.push(child.val());
			});

			this.setWordsStorage(list);
		});
	}

	/**
	 * Colocando lista de palabras
	 * @param {Array} words
	 */
	async setWordsStorage(words){
		if(words.length > MIN_WORDS){
			try {
				await AsyncStorage.setItem(LIST_WORDS, JSON.stringify(words));
			} catch (error) {
				console.error('STORAGE-WORDS', error.toString());
			}
		}
	}


	/**
	 * Obtener un array con palabras al azar
	 * @param  {Number} h Alto
	 * @param  {Number} w Ancho
	 * @return {Array}    Palabras a colocar
	 */
	async _getDB (h=4, w=4){
		var max =  ( ( ( w * 2 ) + ( h * 2  ) ) * 2 ) + ( ( ( h + w ) * 2 ) * 2 );
		var maxDB = [];

		for(var i in WORD){
			if (this.selectWord(WORD[i], i)) {
				maxDB.push(i);
				max--;
			}

			if(max < 0){
				break;
			}
		}

		return maxDB;
	}

	/**
	 * Selecionador de palabras
	 * @param  {Object} word
	 * @param  {Array} word.tag  Las categorias que pertence
	 * @param  {Array} word.lang Los idiomas que pertence
	 * @return {Boolean}         Si pertence segun la configuracion
	 */
	selectWord(word, name){
		var len = name.replace(NO_CHAR, '').split('').length;

		var z3 = (this.setting.lang.length == 0 || _.intersection(this.setting.lang, word.lang).length > 0 );
		var z4 = (this.setting.tag.length == 0 || _.intersection(this.setting.tag, word.tag).length > 0);

		return len <= this.setting.width && len >= MIN_LETTER && z3 && z4;
	}

	/**
	 * Generador de variablilidad de posiscion de palabras
	 * @return {Array} El segundo argumento de _matrixWord
	 */
	position (){
		return _.shuffle([
			[ 1, 1, false ], //diga1 :
			[ 1, 0, false ], //horz1 :
			[ 0, 1, false ], //vert1 :
			[ 1, 1, true  ], //diga1 :
			[ 1, 0, true  ], //horz1 :
			[ 0, 1, true  ], //vert1 :
		]);
	}

	/**
	 * Iniciador de constructor de matrixes
	 * @return {Object} Toda la matrix
	 */
	async init(){
		var sett = await AsyncStorage.getItem(SETTINGS);

		if( sett != null && sett.length ){
			this.setting = JSON.parse(sett);
		}

		if(this.setting.lang.length <= 0){
			this.setting.lang = [ I18n.t('lang') ];
		}

		var mx = await this._createMatrix();
		var space = this._isSpace(mx.matrix);

		for (var i = 0; i < space.length; i++) {
			mx.matrix[space.x][space.y] = _.sample(this.LETTERS);
		}

		return mx;
	}

	/**
	 * Is all add
	 * @param  {Array}  m  dos dimensiones
	 * @return {Boolean}   [description]
	 */
	_isSpace (m){
		var isOk = [];

		for (let x = m.length - 1; x >= 0; x--) {
			for (let y = m[x].length - 1; y >= 0; y--) {
				if(_.isEmpty(m[x][y])){
					isOk.push({ x, y });
				}
			}
		}

		return isOk;
	}

	/**
	 * Creador de matrixes
	 * @return {Object} Un Matrix 2D y un array de las palabras
	 */
	async _createMatrix(){
		var matrix = new Array(Math.floor( this.setting.width * this.setting.numMax ));
		var words  = [];

		for (let i = matrix.length - 1; i >= 0; i--) {
			matrix[i] = new Array(this.setting.width);
		}
		var spaces = this._isSpace(matrix).length;
		var tall = await this._getDB(matrix.length, this.setting.width);

		for (var i = tall.length - 1; i >= 0 && this._isSpace(matrix).length > 0; i--) {
			var pos = this.position();
			var vector = {
				letras : tall[i].replace(NO_CHAR, '').toLowerCase().split(''),
				x : 0,
				y : 0
			};

			for (var z = pos.length - 1; z >= 0; z--) {
				var newMatrix = await this._matrixWord(matrix, pos[z], vector);

				if(newMatrix && _.isArray(newMatrix)){
					words.push(tall[i]);
					matrix = newMatrix;
					break;
				}
			}
		}

		return { words, matrix };
	}


	/**
	 * Funcion de colocar palabras
	 * @param  {Array}  m      Array en dos dimenciones
	 * @param  {Array}  d      Vector deconstrucion
	 * @param  {Object} vector Palabra
	 * @return {Boolean|Array} La matrix o un false si lo la pone
	 */
	async _matrixWord (m, d, vector) {
		var n = clone(m),
			x = vector.x,
			y = vector.y,
			i = 0;

		if(!d[2]){
			d[0] *= d[0] == 0 ? 0 : - 1;
			d[1] *= d[1] == 0 ? 0 : - 1;
		}

		for (i = vector.letras.length - 1; i >= 0; i--) {
			x += ( i == vector.letras.length - 1 ? d[2] ? 0 : n.length - 1 : d[0] );
			y += ( i == vector.letras.length - 1 ? d[2] ? 0 : n[0].length - 1 : d[1] );

			if(y < n[0].length && x < n.length && x >= 0 && y >= 0 &&
				( _.isEmpty(n[x][y]) || n[x][y] === vector.letras[i]) ){
				n[x][y] = vector.letras[i];
			} else {
				break;
			}
		}

		if (i < 0){
			return n;
		} else if (vector.y < m[0].length){
			vector.y++;
			return this._matrixWord(m, d, vector);
		} else if( vector.x < m.length ){
			vector.x++;
			vector.y = 0;
			return this._matrixWord(m, d, vector);
		} else {
			vector.y = 0;
			vector.x = 0;
			return false;
		}
	}
}
