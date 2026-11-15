import { StyleSheet } from 'react-native';

export const screenPadding = 16;

export const screenStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: screenPadding,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
    gap: 8,
  },
});