import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/PageHeader';

export default function TermsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Terms of Service" showBack />
      <ScrollView className="flex-1 px-6">
        <Text className="text-base text-foreground leading-6">
          By using EasyCollect, you agree to these terms of service.{'\n\n'}
          EasyCollect provides a platform for landlords to manage rent collection and for tenants to make payments. We are not a financial institution and do not hold funds.{'\n\n'}
          Users are responsible for the accuracy of information provided. Landlords are responsible for ensuring compliance with local rental laws.{'\n\n'}
          We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.{'\n\n'}
          EasyCollect is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our platform.{'\n\n'}
          These terms are governed by the laws of Jamaica. Contact us at support@easycollectja.com for questions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
