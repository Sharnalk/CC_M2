// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const React = require('react');
  return {
    enableScreens: jest.fn(),
    ScreenContainer: ({ children }) => children,
    Screen: ({ children }) => children,
  };
});
