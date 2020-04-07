import {
  Animated,
  Keyboard,
  LayoutAnimation,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Direction, SwiperDirection, ZIndex} from './constants';
import gestureHook, {sideSwiperCreator, SideSwiperCreatorArgs} from './helper';
interface DrawerPropsType {
  show: boolean;
  from: Direction;
  width?: string | number;
  height?: string | number;
  onPressMask?(): void;
  scroll?: boolean;
  onHide?(): void;
}

const defaultSize = 300;
const defaultDuration = 300;
const defaultMaxHidenRatio = 0.5; // Drawer跟随手势的最大临界比例  超过 则手势结束后  隐藏

const Drawer: React.FC<DrawerPropsType> = ({
  show = false,
  children,
  from,
  width,
  height,
  onPressMask = () => {
    return;
  },
  scroll = true,
  onHide,
}) => {
  const [size, setSize] = useState(null);
  const [gestureDisplacement, setGestureDisplacement] = useState([0, 0]);

  const flexDirection = useMemo(() => {
    return from === Direction.RIGHT || from === Direction.LEFT
      ? 'row'
      : 'column';
  }, [from]);

  const [width1, height1] = useMemo(() => {
    if (from === Direction.RIGHT || from === Direction.LEFT) {
      return [width || defaultSize, height || '100%'];
    } else {
      return [width || '100%', height || defaultSize];
    }
  }, [from, height, width]);

  const distance = useMemo(() => {
    LayoutAnimation.easeInEaseOut();
    if (!size) {
      return -2000; // 设置一个足够大的尺寸
    }
    if (show) {
      return 0;
    }

    if (from === Direction.RIGHT || from === Direction.LEFT) {
      return 0 - size.width;
    } else {
      return 0 - size.height;
    }
  }, [size, show]);

  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboradHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = e => {
      setKeyboardShown(true);
      setKeyboardHeight(e.endCoordinates.height);
    };
    const hideEvent = e => {
      setKeyboardShown(false);
      setKeyboardHeight(0);
    };

    Keyboard.addListener('keyboardDidShow', showEvent);
    Keyboard.addListener('keyboardDidHide', hideEvent);
    return () => {
      Keyboard.removeListener('keyboardDidShow', showEvent);
      Keyboard.removeListener('keyboardDidHide', hideEvent);
    };
  }, []);

  const [displayDelay, setDisplayDelay] = useState<'flex' | 'none'>('none');
  useEffect(() => {
    LayoutAnimation.easeInEaseOut();
    if (show) {
      setDisplayDelay('flex');
    } else {
      setTimeout(() => {
        setDisplayDelay('none');
      }, defaultDuration + 100);
      setTimeout(() => {
        setGestureDisplacement([0, 0]);
      }, defaultDuration + 200);
    }
  }, [show]);

  const onPressMaskInner = () => {
    Keyboard.dismiss();
    onPressMask();
  };

  // Drawer 手势跟随
  const {translateY, translateX} = useMemo(() => {
    if (from === Direction.TOP) {
      return {
        translateY: gestureDisplacement[1] < 0 ? gestureDisplacement[1] : 0,
        translateX: 0,
      };
    } else if (from === Direction.RIGHT) {
      return {
        translateY: 0,
        translateX: gestureDisplacement[0] > 0 ? gestureDisplacement[0] : 0,
      };
    } else if (from === Direction.BOTTOM) {
      return {
        translateY: gestureDisplacement[1] > 0 ? gestureDisplacement[1] : 0,
        translateX: 0,
      };
    } else if (from === Direction.LEFT) {
      return {
        translateY: 0,
        translateX: gestureDisplacement[0] < 0 ? gestureDisplacement[0] : 0,
      };
    } else {
      return {translateY: 0, translateX: 0};
    }
  }, [gestureDisplacement, from]);

  const [delayRender, setDelayRender] = useState(false);
  useEffect(() => {
    setTimeout(() => setDelayRender(true), 500);
  }, []);

  const onGestureStop = useMemo(
    () => that => {
      const [displacementX, displacementY] = that.displacement;
      if (from === Direction.RIGHT || from === Direction.LEFT) {
        if (Math.abs(displacementX) > size.width * defaultMaxHidenRatio) {
          onHide();
        } else {
          setGestureDisplacement([0, 0]);
        }
      } else {
        if (Math.abs(displacementY) > size.height * defaultMaxHidenRatio) {
          onHide();
        } else {
          setGestureDisplacement([0, 0]);
        }
      }
    },
    [size],
  );

  const onGestureMove = useMemo(
    () => that => {
      setGestureDisplacement(that.displacement);
    },
    [],
  );

  const onGestureSwiper = useMemo(
    () => (that, directions) => {
      if (from === Direction.LEFT && directions[0] === SwiperDirection.LEFT) {
        setGestureDisplacement(that.displacement);
        onHide();
      } else if (
        from === Direction.RIGHT &&
        directions[0] === SwiperDirection.RIGHT
      ) {
        setGestureDisplacement(that.displacement);
        onHide();
      } else if (
        from === Direction.TOP &&
        directions[1] === SwiperDirection.TOP
      ) {
        setGestureDisplacement(that.displacement);
        onHide();
      } else if (
        from === Direction.BOTTOM &&
        directions[1] === SwiperDirection.BOTTOM
      ) {
        setGestureDisplacement(that.displacement);
        onHide();
      }
    },
    [],
  );

  const {gesture, panReponder} = gestureHook({
    onSwiper: onGestureSwiper,
    onStop: onGestureStop,
    onMove: onGestureMove,
  });

  const updateSize = e => {
    const {width: width1, height: height1} = e.nativeEvent.layout;
    setSize({width: width1, height: height1});
  };

  return delayRender ? (
    <View
      style={{
        display: displayDelay,
        height: '100%',
        width: '100%',
        flexDirection,
        zIndex: ZIndex.G,
        position: 'absolute',
        top: 0,
        left: 0,
        borderWidth: 1,
        overflow: 'hidden',
      }}>
      <TouchableWithoutFeedback onPress={onPressMaskInner}>
        <View style={{backgroundColor: 'rgba(0,0,0,0.5)', flex: 1}} />
      </TouchableWithoutFeedback>
      <View
        onLayout={updateSize}
        style={{
          display: displayDelay,
          width: width1,
          height: height1,
          backgroundColor: '#fff',
          position: 'absolute',
          transform: [
            {
              translateY,
            },
            {translateX},
          ],
          [from]: distance,
        }}>
        {scroll ? (
          <ScrollView {...panReponder.panHandlers}>
            <View style={{flex: 1, borderWidth: 1}}>{children}</View>
          </ScrollView>
        ) : (
          <View {...panReponder.panHandlers} style={{flex: 1, borderWidth: 1}}>
            {children}
          </View>
        )}
      </View>
    </View>
  ) : null;
};

export const SideSwiper = ({
  size,
  onSwiper,
  config,
  boundary,
  children,
}: SideSwiperCreatorArgs) => {
  if (!size) {
    return null;
  }
  const {sideSwiperReponder} = useMemo(() => {
    return sideSwiperCreator({
      size,
      onSwiper,
      config,
      boundary,
    });
  }, [size]);
  return (
    <View
      {...sideSwiperReponder.panHandlers}
      style={{
        ...StyleSheet.absoluteFillObject,
      }}>
      {children}
    </View>
  );
};

export default Drawer;
