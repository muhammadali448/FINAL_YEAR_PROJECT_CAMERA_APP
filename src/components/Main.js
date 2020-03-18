import React from 'react';
import {View, Text} from 'react-native';
import LinearGradientComponent from './LinearGradient';
import {Button} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styles from '../styles/appStyles';
const Main = props => {
  return (
    <LinearGradientComponent slideStyle={styles.slideStyle}>
      <Icon name="handshake" size={30} color="#900" style={styles.icon} />
      <View style={styles.txtContainer}>
        <Text style={styles.textStyle}>SMART GLOVE</Text>
        <Text style={styles.smallTextStyle}>
          created by Muhammad Ali, Yasir Abbas, Maryam Jahangir
        </Text>
      </View>
      <Button
        block
        style={styles.buttonStyle}
        onPress={() => props.navigation.navigate('Camera')}>
        <Text style={styles.btnTextStyle}>Camera</Text>
      </Button>
    </LinearGradientComponent>
  );
};

export default Main;
