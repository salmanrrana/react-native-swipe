import React, { Component } from 'react';
import { View, Text, Animated } from 'react-native';

class Ball extends Component {
  componentWillMount() {
    this.position = new Animated.ValueXY(0, 0);
    Animated.spring(this.position, {
      toValue: { x: 200, y: 500 }
    }).start();
  }

  render() {
    return (
      <Animated.View style={this.position.getLayout()}>
        <View style={styles.ball} />
      </Animated.View>
    );
  }
}

const styles = {
  ball: {
    height: 80,
    width: 80,
    borderRadius: 50,
    borderWidth: 50,
    borderColor: '#E8C547',
  }
}

export default Ball;
