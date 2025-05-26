import * as React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import { RootStackParamList } from './Types';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as RNLocalize from 'react-native-localize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { RootStackParamList } from './Types';
import i18n from './i18n';
import { setLanguage } from './Storage';
import Register from './pages/Register';
import RoomList from './pages/RoomList';
import ChatRoom from './pages/ChatRoom';
import RoomMembers from './pages/RoomMembers';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const navigationRef = React.useRef<NavigationContainerRef<RootStackParamList>>(null);
  const scheme = useColorScheme();

  React.useEffect(() => {
    const locales = RNLocalize.getLocales();
    if (Array.isArray(locales)) {
      const deviceLanguage = locales[0].languageCode;
      console.log('deviceLanguage: ', deviceLanguage);
      setLanguage(deviceLanguage);
      i18n.changeLanguage(deviceLanguage);
    }
  }, []);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack.Navigator>
            <Stack.Screen
              name="Register"
              component={Register}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RoomList"
              component={RoomList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoom}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RoomMembers"
              component={RoomMembers}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
