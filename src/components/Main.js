import React, {Component} from 'react';
import {View, Text} from 'react-native';
import LinearGradientComponent from './LinearGradient';
import {Button} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styles from '../styles/appStyles';
import {ViroUtils} from 'react-viro';
var isARSupportedOnDevice = ViroUtils.isARSupportedOnDevice;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isArSupported: false,
    };
  }

  componentWillMount() {
    isARSupportedOnDevice(this._handleARNotSupported, this._handleARSupported);
  }

  _handleARSupported = () => {
    console.log('AR supported');
    this.setState({
      isArSupported: true,
    });
  };
  _handleARNotSupported = reason => {
    console.log('AR not supported, with reason: ' + reason);
    this.setState({
      isArSupported: false,
    });
  };

  // {isArSupported ? (
  //   <Button
  //     block
  //     style={styles.buttonStyle}
  //     onPress={() => this.props.navigation.navigate('Camera')}>
  //     <Text style={styles.btnTextStyle}>Camera</Text>
  //   </Button>
  // ) : (
  //   <Button block style={styles.buttonStyle}>
  //     <Text style={styles.btnTextStyle}>Start Speech</Text>
  //   </Button>
  // )}

  render() {
    const {isArSupported} = this.state;
    return (
      <LinearGradientComponent slideStyle={styles.slideStyle}>
        <Icon name="handshake" size={30} color="#900" style={styles.icon} />
        <View style={styles.txtContainer}>
          <Text style={styles.textStyle}>SMART GLOVE</Text>
          <Text style={styles.smallTextStyle}>
            created by Muhammad Ali, Yasir Abbas, Maryam Jahangir
          </Text>
          <Button
            block
            style={styles.buttonStyle}
            onPress={() => this.props.navigation.navigate('Camera')}>
            <Text style={styles.btnTextStyle}>Camera</Text>
          </Button>
        </View>
      </LinearGradientComponent>
    );
  }
}

export default Main;
