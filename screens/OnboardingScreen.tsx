import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../providers/SubscriptionProvider';
const OnboardingScreen = () => {
  const { activePaidUser } = useSubscription();
  const navigation = useNavigation<any>();
  if (activePaidUser) {
    navigation.navigate('Home');
  }

  return (
    <View>
      <Text>OnboardingScreen</Text>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({});
