import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
 } from 'react-native';

 const SCREEN_WIDTH = Dimensions.get('window').width;
 const SWIPE_THRESHOLD = 0.35 * SCREEN_WIDTH;
 const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  //if a user of this component does not pass in a function called onSwipeRight then
  //it will call this prop below as a default
  //default props helps us with reuseable components
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }

  constructor(props){
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPostion();
        }
      }
    });
    this.state = { panResponder, position, index: 0 };
  }

  componentWillReceiveProps(nextProps) {
    //this is a life cycle method thats called when new set of components
    //are going to updated with a new set of props. can compare with prevoius props
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0})
    }
  }

  componentWillUpdate() {
    //this is for android
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    //this tells it to animate any changes. so this will animate the change of the cards after a swipe
    LayoutAnimation.spring();
  }

  resetPostion() {
    //spring will animate a spring
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  forceSwipe(direction) {
    //timing is a more linear motion and doinest have fancy spring
    //need to have duration value for timing
    //gonna combine swipe for left and right
    // IF DIRECTION IS EQUAL TO RIGHT IT WILL RETURN CODE BETWEEN
    // ? AND : . IF IT IS NOT RIGHT IT WILL BE -SCREEN_WIDTH
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    //by adding this props item we are getting the index number and Now
    //able to pass to onswipe right and onswipe left from main.js
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    //this makes sure that the next card does not follow the position of the card that was swiped
    this.state.position.setValue({ x: 0, y: 0 })
    this.setState({ index: this.state.index + 1 });
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-100deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards() {
    if(this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }
      return this.props.data.map((item, i) => {
      // if the cards have already been swiped, do not return anything
      if (i < this.state.index) { return null }

      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return (
        //this is the cards behind the current card shoing on the screen
        //we are adding styling to these cards in order to cascade
        <Animated.View
          key={item.id}
          //this.state.index allows the cards to move up after a card is swiped
          style={[styles.cardStyle, { top: 10 * (i-this.state.index) }]}>
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }

  render(){
    return(
      <View>
        {this.renderCards()}
      </View>
    )
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    //CAN ALSO USE LEFT: 0 AND RIGHT: 0 BUT IT CAN CAUSE ISSUES
    width: SCREEN_WIDTH
  }
}

export default Deck;
