import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Slider} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Voice from '@react-native-community/voice';
const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const landmarkSize = 2;

export default class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    canDetectFaces: false,
    faces: [],
    recognized: '',
    pitch: '',
    error: '',
    end: '',
    started: '',
    results: [],
    partialResults: [],
  };

  constructor(props) {
    super(props);
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  onSpeechStart = e => {
    console.log('onSpeechStart: ', e);
    this.setState({
      started: '√',
    });
  };

  onSpeechRecognized = e => {
    console.log('onSpeechRecognized: ', e);
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = async e => {
    await Voice.isRecognizing().then(result => {
      console.log('RESULT', result);
      if (result !== 1) {
        Voice.start('en-US');
      } else {
        return true;
      }
    });
  };

  onSpeechError = e => {
    console.log('onSpeechError: ', e);
    this.setState({
      error: JSON.stringify(e.error),
    });
  };

  onSpeechResults = e => {
    console.log('onSpeechResults: ', e);
    this.setState({
      results: e.value,
    });
  };

  onSpeechPartialResults = e => {
    console.log('onSpeechPartialResults: ', e);
    this.setState({
      partialResults: e.value,
    });
  };

  onSpeechVolumeChanged = e => {
    console.log('onSpeechVolumeChanged: ', e);
    this.setState({
      pitch: e.value,
    });
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });

    try {
      Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };

  _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });
  };

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
    });
  }

  setFocusDepth(depth) {
    this.setState({
      depth,
    });
  }

  takePicture = async function() {
    if (this.camera) {
      const data = await this.camera.takePictureAsync();
      console.warn('takePicture ', data);
    }
  };

  takeVideo = async function() {
    if (this.camera) {
      try {
        const promise = this.camera.recordAsync(this.state.recordOptions);

        if (promise) {
          this.setState({isRecording: true});
          const data = await promise;
          this.setState({isRecording: false});
          console.warn('takeVideo', data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  toggle = value => () =>
    this.setState(prevState => ({[value]: !prevState[value]}));

  facesDetected = ({faces}) => this.setState({faces});

  renderFace = face => {
    console.log('FACES', face);
    if (face) {
      return (
        <View
          key={face.faceID}
          transform={[
            {perspective: 600},
            {rotateZ: `${face.rollAngle.toFixed(0)}deg`},
            {rotateY: `${face.yawAngle.toFixed(0)}deg`},
          ]}
          style={[
            styles.face,
            {
              ...face.bounds.size,
              left: face.bounds.origin.x,
              top: -120 + face.bounds.origin.y,
            },
          ]}>
          {this.state.partialResults.map((result, index) => {
            return (
              <Text key={`partial-result-${index}`} style={{color: 'yellow'}}>
                {result}
              </Text>
            );
          })}
        </View>
      );
    } else {
      return;
    }
  };

  renderFaces = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.renderFace(this.state.faces[0])}
    </View>
  );

  renderCamera() {
    const {canDetectFaces} = this.state;
    return (
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        trackingEnabled
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        faceDetectionLandmarks={
          RNCamera.Constants.FaceDetection.Landmarks
            ? RNCamera.Constants.FaceDetection.Landmarks.all
            : undefined
        }
        faceDetectionClassifications={
          RNCamera.Constants.FaceDetection.Classifications
            ? RNCamera.Constants.FaceDetection.Classifications.all
            : undefined
        }
        onFacesDetected={canDetectFaces ? this.facesDetected : null}>
        <View
          style={{
            flex: 0.5,
          }}>
          <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={this.toggleFacing.bind(this)}>
              <Text style={styles.flipText}> FLIP </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={this.toggleFlash.bind(this)}>
              <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={this.toggleWB.bind(this)}>
              <Text style={styles.flipText}>
                {' '}
                WB: {this.state.whiteBalance}{' '}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity
              onPress={this.toggle('canDetectFaces')}
              style={styles.flipButton}>
              <Text style={styles.flipText}>
                {!canDetectFaces ? 'Detect Faces' : 'Detecting Faces'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 0.4,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end',
          }}>
          <Slider
            style={{width: 150, marginTop: 15, alignSelf: 'flex-end'}}
            onValueChange={this.setFocusDepth.bind(this)}
            step={0.1}
            disabled={this.state.autoFocus === 'on'}
          />
        </View>
        {this.state.zoom !== 0 && (
          <Text style={[styles.flipText, styles.zoomText]}>
            Zoom: {this.state.zoom}
          </Text>
        )}
        <View
          style={{
            flex: 0.1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end',
          }}>
          <TouchableOpacity
            style={[styles.flipButton, {flex: 0.25, alignSelf: 'flex-end'}]}
            onPress={this.toggleFocus.bind(this)}>
            <Text style={styles.flipText}> AF : {this.state.autoFocus} </Text>
          </TouchableOpacity>
          {canDetectFaces && (
            <View>
              <TouchableOpacity
                style={[
                  styles.flipButton,
                  styles.picButton,
                  {flex: 0.3, alignSelf: 'flex-end'},
                ]}
                onPress={this._startRecognizing}>
                <Text style={styles.flipText}> START SPEECH </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.flipButton,
                  styles.picButton,
                  {flex: 0.3, alignSelf: 'flex-end'},
                ]}
                onPress={this._destroyRecognizer}>
                <Text style={styles.flipText}> END SPEECH </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {!!canDetectFaces && this.renderFaces()}
      </RNCamera>
    );
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: 'yellow',
    flexWrap: 'nowrap',
    // justifyContent: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
