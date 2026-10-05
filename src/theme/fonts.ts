import { fontNames } from './designTokens';
import { useFonts } from 'expo-font';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat/400Regular';
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat/500Medium';
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat/600SemiBold';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold';
import { Montserrat_400Regular_Italic } from '@expo-google-fonts/montserrat/400Regular_Italic';
export const fontAssets = {
  [fontNames.Regular]: Montserrat_400Regular,
  [fontNames.Medium]: Montserrat_500Medium,
  [fontNames.SemiBold]: Montserrat_600SemiBold,
  [fontNames.Bold]: Montserrat_700Bold,
  [fontNames.Italic]: Montserrat_400Regular_Italic,
};
export const useDesignFonts = () => useFonts(fontAssets);
