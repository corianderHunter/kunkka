import { GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { SwiperDirection, GestureStatus } from './constants';
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
declare class Gesture {
    status: GestureStatus;
    swiperDistanceLimit: number;
    swiperSpeedLimit: number;
    origin: [number, number];
    originTimestamp: number;
    relativeOrigin: [number, number];
    destination: [number, number];
    displacement: [number, number];
    swiperDirections: SwiperDirection[];
    onStart: (thisArgs?: Gesture, gestureState?: PanResponderGestureState) => void;
    onMove: (thisArgs?: Gesture, gestureState?: PanResponderGestureState) => void;
    onStop: (thisArgs?: Gesture, gestureState?: PanResponderGestureState) => void;
    onSwiper: (thisArgs?: Gesture, directions?: SwiperDirection[]) => void;
    constructor({ config, onStart, onMove, onStop, onSwiper, }: GestureArgs);
    reset(): void;
    dispatchDirection(dx: number, dy: number, vx: number, vy: number): void;
    start(gestureState: PanResponderGestureState, evt: GestureResponderEvent): void;
    move(gestureState: PanResponderGestureState, evt: any): void;
    stop(gestureState: PanResponderGestureState): void;
}
declare const gestureHook: ({ config, onStart, onMove, onStop, onSwiper, }: GestureArgs) => {
    gesture: Gesture;
    panReponder: import("react-native").PanResponderInstance;
};
export interface SideSwiperCreatorArgs {
    size: {
        width?: number;
        height?: number;
    };
    onSwiper: (direction: SwiperDirection) => void;
    config?: GestureArgs;
    boundary?: number;
}
export declare const sideSwiperCreator: ({ size, onSwiper, config, boundary, }: SideSwiperCreatorArgs) => {
    gesture: Gesture;
    sideSwiperReponder: import("react-native").PanResponderInstance;
};
export default gestureHook;
