import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/PageHeader';

export default function PrivacyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Privacy Policy" showBack />
      <ScrollView className="flex-1 px-6">
        <Text className="text-base text-foreground leading-6">
          EasyCollect ("we", "us", or "our") operates the EasyCollect mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our app.{'\n\n'}
          We collect information you provide directly, including your name, email address, phone number, and payment information. This data is used to provide and improve our rent collection services.{'\n\n'}
          We use Supabase for data storage and authentication. Your data is encrypted in transit and at rest. We do not sell your personal information to third parties.{'\n\n'}
          You have the right to access, update, or delete your personal information at any time through the app settings.{'\n\n'}
          Contact us at support@easycollectja.com for any privacy-related questions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
