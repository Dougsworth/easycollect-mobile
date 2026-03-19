import React from 'react';
import { View, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Button } from '@/components/ui';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-8 bg-white">
          <Text className="text-xl font-bold text-foreground mb-2">Something went wrong</Text>
          <Text className="text-sm text-muted-foreground text-center mb-6">
            An unexpected error occurred. Please try again.
          </Text>
          <Button onPress={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
