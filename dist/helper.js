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
import {useMemo} from 'react';
import {PanResponder} from 'react-native';
import {SwiperDirection, GestureStatus} from './constants';
var defaultSwiperDistanceLimit = 50;
var defaultSwiperSpeedLimit = 1;
var defaultDistance = 20;
var defaultTimeGap = 100;
var Gesture = /** @class */ (function() {
  function Gesture(_a) {
    var _b = _a.config,
      config = _b === void 0 ? {} : _b,
      _c = _a.onStart,
      onStart =
        _c === void 0
          ? function() {
              return;
            }
          : _c,
      _d = _a.onMove,
      onMove =
        _d === void 0
          ? function() {
              return;
            }
          : _d,
      _e = _a.onStop,
      onStop =
        _e === void 0
          ? function() {
              return;
            }
          : _e,
      _f = _a.onSwiper,
      onSwiper =
        _f === void 0
          ? function() {
              return;
            }
          : _f;
    this.status = GestureStatus.SLIENCE;
    this.swiperDistanceLimit = defaultSwiperDistanceLimit;
    this.swiperSpeedLimit = defaultSwiperSpeedLimit;
    this.origin = [null, null];
    this.originTimestamp = 0;
    this.relativeOrigin = [null, null];
    this.destination = [null, null];
    this.displacement = [0, 0];
    this.swiperDirections = [SwiperDirection.SLIENCE, SwiperDirection.SLIENCE]; // [水平方向，垂直方向]
    if (config.distanceLimit) {
      this.swiperDistanceLimit = config.distanceLimit;
    }
    if (config.speedLimit) {
      this.swiperSpeedLimit = config.speedLimit;
    }
    this.onStart = onStart;
    this.onMove = onMove;
    this.onStop = onStop;
    this.onSwiper = onSwiper;
  }
  Gesture.prototype.reset = function() {
    this.origin = [null, null];
    this.relativeOrigin = [null, null];
    this.destination = [null, null];
    this.displacement = [0, 0];
    this.swiperDirections = [SwiperDirection.SLIENCE, SwiperDirection.SLIENCE];
    this.originTimestamp = 0;
  };
  Gesture.prototype.dispatchDirection = function(dx, dy, vx, vy) {
    if (!this.swiperDirections[0]) {
      if (dx > this.swiperDistanceLimit && vx > this.swiperSpeedLimit) {
        this.swiperDirections[0] = SwiperDirection.RIGHT;
      } else if (
        dx < 0 - this.swiperDistanceLimit &&
        vx < 0 - this.swiperSpeedLimit
      ) {
        this.swiperDirections[0] = SwiperDirection.LEFT;
      }
    }
    if (!this.swiperDirections[1]) {
      if (dy > this.swiperDistanceLimit && vy > this.swiperSpeedLimit) {
        this.swiperDirections[1] = SwiperDirection.BOTTOM;
      } else if (
        dy < 0 - this.swiperDistanceLimit &&
        vy < 0 - this.swiperSpeedLimit
      ) {
        this.swiperDirections[1] = SwiperDirection.TOP;
      }
    }
  };
  Gesture.prototype.start = function(gestureState, evt) {
    this.status = GestureStatus.ACTIVE;
    var x0 = gestureState.x0,
      y0 = gestureState.y0,
      dx = gestureState.dx,
      dy = gestureState.dy,
      vx = gestureState.vx,
      vy = gestureState.vy;
    var _a = evt.nativeEvent,
      locationX = _a.locationX,
      locationY = _a.locationY;
    this.origin = [x0, y0];
    this.originTimestamp = evt.nativeEvent.timestamp;
    this.relativeOrigin = [locationX, locationY];
    this.displacement = [dx, dy];
    this.dispatchDirection(dx, dy, vx, vy);
    this.onStart(this, gestureState);
  };
  Gesture.prototype.move = function(gestureState, evt) {
    var dx = gestureState.dx,
      dy = gestureState.dy,
      vx = gestureState.vx,
      vy = gestureState.vy;
    this.displacement = [dx, dy];
    this.dispatchDirection(dx, dy, vx, vy);
    if (evt.nativeEvent.timestamp - this.originTimestamp > defaultTimeGap) {
      if (Math.abs(dx) > defaultDistance || Math.abs(dy) > defaultDistance) {
        this.onMove(this, gestureState);
      }
    }
  };
  Gesture.prototype.stop = function(gestureState) {
    this.status = GestureStatus.SLIENCE;
    var x0 = gestureState.x0,
      y0 = gestureState.y0,
      dx = gestureState.dx,
      dy = gestureState.dy,
      vx = gestureState.vx,
      vy = gestureState.vy;
    this.destination = [x0, y0];
    this.displacement = [dx, dy];
    this.dispatchDirection(dx, dy, vx, vy);
    var directions = this.swiperDirections.filter(function(v) {
      return v !== SwiperDirection.SLIENCE;
    });
    this.onStop(this, gestureState);
    if (directions.length) {
      this.onSwiper(this, directions);
    }
    this.reset();
  };
  return Gesture;
})();
var gestureHook = function(_a) {
  var config = _a.config,
    onStart = _a.onStart,
    onMove = _a.onMove,
    onStop = _a.onStop,
    onSwiper = _a.onSwiper;
  var gesture = useMemo(
    function() {
      return new Gesture({
        config: config,
        onStart: onStart,
        onMove: onMove,
        onStop: onStop,
        onSwiper: onSwiper,
      });
    },
    [config, onStart, onMove, onStop, onSwiper],
  );
  var panReponder = useMemo(
    function() {
      return PanResponder.create({
        onStartShouldSetPanResponder: function() {
          return true;
        },
        onStartShouldSetPanResponderCapture: function(evt, gestureState) {
          return false;
        },
        onMoveShouldSetPanResponder: function() {
          return true;
        },
        onMoveShouldSetPanResponderCapture: function() {
          return true;
        },
        onPanResponderGrant: function(evt, gestureState) {
          gesture.start(gestureState, evt);
        },
        onPanResponderMove: function(evt, gestureState) {
          gesture.move(gestureState, evt);
        },
        onPanResponderTerminationRequest: function() {
          return true;
        },
        onPanResponderRelease: function(evt, gestureState) {
          gesture.stop(gestureState);
        },
        onPanResponderTerminate: function() {
          return true;
        },
        onShouldBlockNativeResponder: function() {
          return true;
        },
      });
    },
    [gesture],
  );
  return {gesture: gesture, panReponder: panReponder};
};
var defaultBoundary = 120; //响应侧边滑动的最大尺寸
export var sideSwiperCreator = function(_a) {
  var size = _a.size,
    onSwiper = _a.onSwiper,
    _b = _a.config,
    config = _b === void 0 ? {} : _b,
    _c = _a.boundary,
    boundary = _c === void 0 ? defaultBoundary : _c;
  var newOnSwiper = function(thisArgs, directions) {
    var thisDirection;
    if (config.onSwiper) {
      config.onSwiper(thisArgs, directions);
    }
    if (directions[0] === SwiperDirection.RIGHT) {
      if (thisArgs.relativeOrigin[0] < boundary) {
        thisDirection = SwiperDirection.RIGHT;
      }
    }
    if (directions[0] === SwiperDirection.LEFT) {
      if (boundary > size.width - thisArgs.relativeOrigin[0]) {
        thisDirection = SwiperDirection.LEFT;
      }
    }
    if (directions[0] === SwiperDirection.BOTTOM) {
      if (thisArgs.relativeOrigin[1] < boundary) {
        thisDirection = SwiperDirection.BOTTOM;
      }
    }
    if (directions[0] === SwiperDirection.TOP) {
      if (boundary > size.height - thisArgs.relativeOrigin[1]) {
        thisDirection = SwiperDirection.TOP;
      }
    }
    if (thisDirection) {
      onSwiper(thisDirection);
    }
  };
  var gesture = new Gesture(__assign({}, config, {onSwiper: newOnSwiper}));
  var sideSwiperReponder = PanResponder.create({
    onStartShouldSetPanResponder: function() {
      return true;
    },
    onStartShouldSetPanResponderCapture: function(evt, gestureState) {
      return false;
    },
    onMoveShouldSetPanResponder: function() {
      return false;
    },
    onMoveShouldSetPanResponderCapture: function() {
      return false;
    },
    onPanResponderGrant: function(evt, gestureState) {
      gesture.start(gestureState, evt);
    },
    onPanResponderMove: function(evt, gestureState) {
      gesture.move(gestureState, evt);
    },
    onPanResponderTerminationRequest: function() {
      return true;
    },
    onPanResponderRelease: function(evt, gestureState) {
      gesture.stop(gestureState);
    },
    onPanResponderTerminate: function() {
      return true;
    },
    onShouldBlockNativeResponder: function() {
      return true;
    },
  });
  return {gesture: gesture, sideSwiperReponder: sideSwiperReponder};
};
export default gestureHook;
