import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home" color={color} />,
        }}
      />
         <Tabs.Screen
        name="Pay"
        options={{
          title: 'Pay',
          tabBarIcon: ({ color }) => <FontAwesome6 name="amazon-pay" size={24} color="black" />,
        }}
      />
    </Tabs>
  );
}