import { useFonts as useExpoFonts } from 'expo-font';
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  RobotoMono_400Regular,
  RobotoMono_500Medium,
  RobotoMono_600SemiBold,
} from '@expo-google-fonts/roboto-mono';

export const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    // Poppins for headlines and emphasis
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    // Inter for body text and UI
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    // Roboto Mono for numbers, prices, and code
    'RobotoMono-Regular': RobotoMono_400Regular,
    'RobotoMono-Medium': RobotoMono_500Medium,
    'RobotoMono-SemiBold': RobotoMono_600SemiBold,
  });

  return fontsLoaded;
};

