import React, {useState} from 'react';
import {SafeAreaView, View, Text, StatusBar} from 'react-native';
import Drawer, {SideSwiper} from './Drawer';
import {SwiperDirection, Direction} from './Drawer/constants';
import {FlatList, ScrollView} from 'react-native-gesture-handler';

const App: React.FC = () => {
  const [size, setSize] = useState({width: 0, height: 0});

  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [topVisible, setTopVisible] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onLayout={e => {
            const {width, height} = e.nativeEvent.layout;
            setSize({width, height});
          }}>
          <SideSwiper
            size={size}
            onSwiper={d => {
              if (d === SwiperDirection.RIGHT) {
                setLeftVisible(true);
              } else if (d === SwiperDirection.LEFT) {
                setRightVisible(true);
              } else if (d === SwiperDirection.BOTTOM) {
                setTopVisible(true);
              } else if (d === SwiperDirection.TOP) {
                setBottomVisible(true);
              }
            }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 300,
                  height: 300,
                  borderWidth: 1,
                  borderColor: 'blue',
                }}>
                <ScrollView style={{height: 200, width: 200, borderWidth: 1}}>
                  {Array.from({length: 100}).map((v, idx) => (
                    <Text>{idx}</Text>
                  ))}
                </ScrollView>
                <Text
                  style={{margin: 10, fontSize: 20, fontWeight: '700'}}
                  onPress={() => setTopVisible(true)}>
                  topp
                </Text>
                <Text
                  style={{margin: 10, fontSize: 20, fontWeight: '700'}}
                  onPress={() => setRightVisible(true)}>
                  right
                </Text>
                <Text
                  style={{margin: 10, fontSize: 20, fontWeight: '700'}}
                  onPress={() => setBottomVisible(true)}>
                  bottom
                </Text>
                <Text
                  style={{margin: 10, fontSize: 20, fontWeight: '700'}}
                  onPress={() => setLeftVisible(true)}>
                  left
                </Text>
              </View>
            </View>
          </SideSwiper>

          <Drawer
            from={Direction.LEFT}
            show={leftVisible}
            onPressMask={() => {
              setLeftVisible(false);
            }}
            onHide={() => {
              setLeftVisible(false);
            }}>
            <Text style={{margin: 10, fontSize: 20, fontWeight: '700'}}>
              left
            </Text>
          </Drawer>
          <Drawer
            from={Direction.RIGHT}
            show={rightVisible}
            onPressMask={() => {
              setRightVisible(false);
            }}
            onHide={() => {
              setRightVisible(false);
            }}>
            <Text style={{margin: 10, fontSize: 20, fontWeight: '700'}}>
              right
            </Text>
          </Drawer>
          <Drawer
            from={Direction.TOP}
            show={topVisible}
            onPressMask={() => {
              setTopVisible(false);
            }}
            onHide={() => {
              setTopVisible(false);
            }}>
            <Text style={{margin: 10, fontSize: 20, fontWeight: '700'}}>
              topp
            </Text>
          </Drawer>
          <Drawer
            from={Direction.BOTTOM}
            show={bottomVisible}
            onPressMask={() => {
              setBottomVisible(false);
            }}
            onHide={() => {
              setBottomVisible(false);
            }}>
            <Text style={{margin: 10, fontSize: 20, fontWeight: '700'}}>
              bottom
            </Text>
          </Drawer>
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;
