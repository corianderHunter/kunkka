import React from 'react';
import { Direction } from './constants';
import { SideSwiperCreatorArgs } from './helper';
interface DrawerPropsType {
    show: boolean;
    from: Direction;
    width?: string | number;
    height?: string | number;
    onPressMask?(): void;
    scroll?: boolean;
    onHide?(): void;
}
declare const Drawer: React.FC<DrawerPropsType>;
export declare const SideSwiper: ({ size, onSwiper, config, boundary, }: SideSwiperCreatorArgs) => JSX.Element;
export default Drawer;
