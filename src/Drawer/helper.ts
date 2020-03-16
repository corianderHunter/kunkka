import {useMemo} from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';
import {SwiperDirection, GestureStatus} from './constants';

const defaultSwiperDistanceLimit = 50;
const defaultSwiperSpeedLimit = 1;
const defaultDistance = 20;
const defaultTimeGap = 100;

interface GestureConfigType {
  distanceLimit?: number;
  speedLimit?: number;
}

interface GestureArgs {
  config?: GestureConfigType;
  onStart?(thisArgs?: Gesture, gestureState?: PanResponderGestureState): void;
  onMove?(thisArgs?: Gesture, gestureState?: PanResponderGestureState): void;
  onStop?(thisArgs?: Gesture, gestureState?: PanResponderGestureState): void;
  onSwiper?(thisArgs?: Gesture, directions?: SwiperDirection[]): void;
}
class Gesture {
  public status: GestureStatus = GestureStatus.SLIENCE;
  public swiperDistanceLimit: number = defaultSwiperDistanceLimit;
  public swiperSpeedLimit: number = defaultSwiperSpeedLimit;

  public origin: [number, number] = [null, null];
  public originTimestamp: number = 0;
  public relativeOrigin: [number, number] = [null, null];
  public destination: [number, number] = [null, null];
  public displacement: [number, number] = [0, 0];
  public swiperDirections: SwiperDirection[] = [
    SwiperDirection.SLIENCE,
    SwiperDirection.SLIENCE,
  ]; // [水平方向，垂直方向]

  public onStart: (
    thisArgs?: Gesture,
    gestureState?: PanResponderGestureState,
  ) => void;
  public onMove: (
    thisArgs?: Gesture,
    gestureState?: PanResponderGestureState,
  ) => void;
  public onStop: (
    thisArgs?: Gesture,
    gestureState?: PanResponderGestureState,
  ) => void;
  public onSwiper: (thisArgs?: Gesture, directions?: SwiperDirection[]) => void;

  constructor({
    config = {},
    onStart = () => {
      return;
    },
    onMove = () => {
      return;
    },
    onStop = () => {
      return;
    },
    onSwiper = () => {
      return;
    },
  }: GestureArgs) {
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

  public reset() {
    this.origin = [null, null];
    this.relativeOrigin = [null, null];
    this.destination = [null, null];
    this.displacement = [0, 0];
    this.swiperDirections = [SwiperDirection.SLIENCE, SwiperDirection.SLIENCE];
    this.originTimestamp = 0;
  }

  public dispatchDirection(dx: number, dy: number, vx: number, vy: number) {
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
  }

  public start(
    gestureState: PanResponderGestureState,
    evt: GestureResponderEvent,
  ) {
    this.status = GestureStatus.ACTIVE;
    const {x0, y0, dx, dy, vx, vy} = gestureState;
    const {locationX, locationY} = evt.nativeEvent;
    this.origin = [x0, y0];
    this.originTimestamp = evt.nativeEvent.timestamp;
    this.relativeOrigin = [locationX, locationY];
    this.displacement = [dx, dy];
    this.dispatchDirection(dx, dy, vx, vy);
    this.onStart(this, gestureState);
  }

  public move(gestureState: PanResponderGestureState, evt) {
    const {dx, dy, vx, vy} = gestureState;
    this.displacement = [dx, dy];
    this.dispatchDirection(dx, dy, vx, vy);
    if (evt.nativeEvent.timestamp - this.originTimestamp > defaultTimeGap) {
      if (Math.abs(dx) > defaultDistance || Math.abs(dy) > defaultDistance)
        this.onMove(this, gestureState);
    }
  }

  public stop(gestureState: PanResponderGestureState) {
    this.status = GestureStatus.SLIENCE;
    const {x0, y0, dx, dy, vx, vy} = gestureState;
    this.destination = [x0, y0];
    this.displacement = [dx, dy];
    this.dispatchDirection(dx, dy, vx, vy);

    const directions = this.swiperDirections.filter(
      v => v !== SwiperDirection.SLIENCE,
    );
    this.onStop(this, gestureState);
    if (directions.length) {
      this.onSwiper(this, directions);
    }
    this.reset();
  }
}

const gestureHook = ({
  config,
  onStart,
  onMove,
  onStop,
  onSwiper,
}: GestureArgs) => {
  const gesture = useMemo(() => {
    return new Gesture({config, onStart, onMove, onStop, onSwiper});
  }, [config, onStart, onMove, onStop, onSwiper]);

  const panReponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (evt, gestureState) => {
          gesture.start(gestureState, evt);
        },
        onPanResponderMove: (evt, gestureState) => {
          gesture.move(gestureState, evt);
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderRelease: (evt, gestureState) => {
          gesture.stop(gestureState);
        },
        onPanResponderTerminate: () => {
          return true;
        },
        onShouldBlockNativeResponder: () => {
          return true;
        },
      }),
    [gesture],
  );

  return {gesture, panReponder};
};

const defaultBoundary = 120; // 响应侧边滑动的最大尺寸

export interface SideSwiperCreatorArgs {
  size: {width?: number; height?: number};
  onSwiper: (direction: SwiperDirection) => void;
  config?: GestureArgs;
  boundary?: number;
}

export const sideSwiperCreator = ({
  size,
  onSwiper,
  config = {},
  boundary = defaultBoundary,
}: SideSwiperCreatorArgs) => {
  const newOnSwiper = (thisArgs?: Gesture, directions?: SwiperDirection[]) => {
    let thisDirection: SwiperDirection;
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

  const gesture = new Gesture({...config, onSwiper: newOnSwiper});

  const sideSwiperReponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
    onMoveShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderGrant: (evt, gestureState) => {
      gesture.start(gestureState, evt);
    },
    onPanResponderMove: (evt, gestureState) => {
      gesture.move(gestureState, evt);
    },
    onPanResponderTerminationRequest: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      gesture.stop(gestureState);
    },
    onPanResponderTerminate: () => {
      return true;
    },
    onShouldBlockNativeResponder: () => {
      return true;
    },
  });
  return {gesture, sideSwiperReponder};
};

export default gestureHook;
