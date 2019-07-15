/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import I18n from 'react-native-i18n';
import codePush from 'react-native-code-push';
import * as firebase from 'firebase';

import { FIREBASE } from './app.json';
import sopitaDeLetras from './src/index.js';

import es from './locales/es';
import en from './locales/en';

I18n.fallbacks = true;
I18n.translations = { en, es };

global.I18n = I18n;
global.db = firebase.initializeApp(FIREBASE);

AppRegistry.registerComponent('sopitaDeLetras', () => codePush(sopitaDeLetras) );
