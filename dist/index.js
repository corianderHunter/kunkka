var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) {
            if (Object.prototype.hasOwnProperty.call(s, p)) {
              t[p] = s[p];
            }
          }
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import {
  Keyboard,
  LayoutAnimation,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {ZIndex, SwiperDirection, Direction} from './constants';
import gestureHook, {sideSwiperCreator} from './helper';
var defaultSize = 300;
var defaultDuration = 300;
var defaultMaxHidenRatio = 0.5; //Drawer跟随手势的最大临界比例  超过 则手势结束后  隐藏
var Drawer = function(_a) {
  var _b;
  var _c = _a.show,
    show = _c === void 0 ? false : _c,
    children = _a.children,
    from = _a.from,
    width = _a.width,
    height = _a.height,
    _d = _a.onPressMask,
    onPressMask =
      _d === void 0
        ? function() {
            return;
          }
        : _d,
    _e = _a.scroll,
    scroll = _e === void 0 ? true : _e,
    onHide = _a.onHide;
  var _f = useState(null),
    size = _f[0],
    setSize = _f[1];
  var _g = useState([0, 0]),
    gestureDisplacement = _g[0],
    setGestureDisplacement = _g[1];
  var flexDirection = useMemo(
    function() {
      return from === Direction.RIGHT || from === Direction.LEFT
        ? 'row'
        : 'column';
    },
    [from],
  );
  var _h = useMemo(
      function() {
        if (from === Direction.RIGHT || from === Direction.LEFT) {
          return [width || defaultSize, height || '100%'];
        } else {
          return [width || '100%', height || defaultSize];
        }
      },
      [from, height, width],
    ),
    width1 = _h[0],
    height1 = _h[1];
  var distance = useMemo(
    function() {
      LayoutAnimation.easeInEaseOut();
      if (!size) {
        return -2000; //设置一个足够大的尺寸
      }
      if (show) {
        return 0;
      }
      if (from === Direction.RIGHT || from === Direction.LEFT) {
        return 0 - size.width;
      } else {
        return 0 - size.height;
      }
    },
    [size, show],
  );
  var _j = useState(false),
    keyboardShown = _j[0],
    setKeyboardShown = _j[1];
  var _k = useState(0),
    keyboradHeight = _k[0],
    setKeyboardHeight = _k[1];
  useEffect(function() {
    var showEvent = function(e) {
      setKeyboardShown(true);
      setKeyboardHeight(e.endCoordinates.height);
    };
    var hideEvent = function(e) {
      setKeyboardShown(false);
      setKeyboardHeight(0);
    };
    Keyboard.addListener('keyboardDidShow', showEvent);
    Keyboard.addListener('keyboardDidHide', hideEvent);
    return function() {
      Keyboard.removeListener('keyboardDidShow', showEvent);
      Keyboard.removeListener('keyboardDidHide', hideEvent);
    };
  }, []);
  var _l = useState('none'),
    displayDelay = _l[0],
    setDisplayDelay = _l[1];
  useEffect(
    function() {
      LayoutAnimation.easeInEaseOut();
      if (show) {
        setDisplayDelay('flex');
      } else {
        setTimeout(function() {
          setDisplayDelay('none');
        }, defaultDuration + 100);
        setTimeout(function() {
          setGestureDisplacement([0, 0]);
        }, defaultDuration + 200);
      }
    },
    [show],
  );
  var onPressMaskInner = function() {
    Keyboard.dismiss();
    onPressMask();
  };
  //Drawer 手势跟随
  var _m = useMemo(
      function() {
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
      },
      [gestureDisplacement, from],
    ),
    translateY = _m.translateY,
    translateX = _m.translateX;
  var _o = useState(false),
    delayRender = _o[0],
    setDelayRender = _o[1];
  useEffect(function() {
    setTimeout(function() {
      return setDelayRender(true);
    }, 500);
  }, []);
  var onGestureStop = useMemo(
    function() {
      return function(that) {
        var _a = that.displacement,
          displacementX = _a[0],
          displacementY = _a[1];
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
      };
    },
    [size],
  );
  var onGestureMove = useMemo(function() {
    return function(that) {
      setGestureDisplacement(that.displacement);
    };
  }, []);
  var onGestureSwiper = useMemo(function() {
    return function(that, directions) {
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
    };
  }, []);
  var _p = gestureHook({
      onSwiper: onGestureSwiper,
      onStop: onGestureStop,
      onMove: onGestureMove,
    }),
    gesture = _p.gesture,
    panReponder = _p.panReponder;
  var updateSize = function(e) {
    var _a = e.nativeEvent.layout,
      width1 = _a.width,
      height1 = _a.height;
    setSize({width: width1, height: height1});
  };
  return delayRender ? (
    <View
      style={{
        display: displayDelay,
        height: '100%',
        width: '100%',
        flexDirection: flexDirection,
        zIndex: ZIndex.G,
        position: 'absolute',
        top: 0,
        left: 0,
      }}>
      <TouchableWithoutFeedback onPress={onPressMaskInner}>
        <View style={{backgroundColor: 'rgba(0,0,0,0.5)', flex: 1}} />
      </TouchableWithoutFeedback>
      <View
        onLayout={updateSize}
        style={
          ((_b = {
            display: displayDelay,
            width: width1,
            height: height1,
            backgroundColor: '#fff',
            position: 'absolute',
            transform: [
              {
                translateY: translateY,
              },
              {translateX: translateX},
            ],
          }),
          (_b[from] = distance),
          _b)
        }>
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
export var SideSwiper = function(_a) {
  var size = _a.size,
    onSwiper = _a.onSwiper,
    config = _a.config,
    boundary = _a.boundary;
  if (!size) {
    return null;
  }
  var sideSwiperReponder = useMemo(
    function() {
      return sideSwiperCreator({
        size: size,
        onSwiper: onSwiper,
        config: config,
        boundary: boundary,
      });
    },
    [size],
  ).sideSwiperReponder;
  return (
    <View
      {...sideSwiperReponder.panHandlers}
      style={__assign({}, StyleSheet.absoluteFillObject)}
    />
  );
};
export default Drawer;
