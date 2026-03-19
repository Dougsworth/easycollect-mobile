import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, updateCompanyInfo, updateBankDetails, updateNotificationPreferences } from '@/shared/services/profile';
import { getLateFeeSettings, upsertLateFeeSettings } from '@/shared/services/lateFees';
import { getRecurringInvoiceSettings, upsertRecurringInvoiceSettings } from '@/shared/services/recurringInvoices';
import { Card, CardTitle, Input, Button, Switch, Select } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function SettingsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState('');

  // Profile
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  // Company
  const [companyForm, setCompanyForm] = useState({ name: '', address: '', city: '', country: '' });
  // Bank
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', branch: '' });
  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({ payments: true, overdue: true, invoices: true, auto_remind: false });

  useEffect(() => {
    if (profile) {
      setProfileForm({ firstName: profile.first_name, lastName: profile.last_name, email: profile.email, phone: profile.phone ?? '' });
      setCompanyForm({ name: profile.company_name ?? '', address: profile.company_address ?? '', city: profile.company_city ?? '', country: profile.company_country ?? '' });
      setBankForm({ bankName: profile.bank_name ?? '', accountName: profile.bank_account_name ?? '', accountNumber: profile.bank_account_number ?? '', branch: profile.bank_branch ?? '' });
      if (profile.notification_preferences) {
        setNotifPrefs(profile.notification_preferences as any);
      }
    }
  }, [profile]);

  const saveSection = async (section: string, fn: () => Promise<void>) => {
    setSaving(section);
    try { await fn(); await refreshProfile(); Alert.alert('Saved', `${section} updated.`); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setSaving(''); }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Settings" showBack />
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
        {/* Profile */}
        <Card className="mb-4">
          <CardTitle className="mb-3">Profile</CardTitle>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="First Name" value={profileForm.firstName} onChangeText={v => setProfileForm(f => ({ ...f, firstName: v }))} /></View>
            <View className="flex-1"><Input label="Last Name" value={profileForm.lastName} onChangeText={v => setProfileForm(f => ({ ...f, lastName: v }))} /></View>
          </View>
          <Input label="Phone" value={profileForm.phone} onChangeText={v => setProfileForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
          <Button size="sm" loading={saving === 'Profile'} onPress={() => saveSection('Profile', () => updateProfile(user!.id, { first_name: profileForm.firstName, last_name: profileForm.lastName, phone: profileForm.phone }).then(() => {}))}>Save Profile</Button>
        </Card>

        {/* Company */}
        <Card className="mb-4">
          <CardTitle className="mb-3">Company Info</CardTitle>
          <Input label="Company Name" value={companyForm.name} onChangeText={v => setCompanyForm(f => ({ ...f, name: v }))} />
          <Input label="Address" value={companyForm.address} onChangeText={v => setCompanyForm(f => ({ ...f, address: v }))} />
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="City" value={companyForm.city} onChangeText={v => setCompanyForm(f => ({ ...f, city: v }))} /></View>
            <View className="flex-1"><Input label="Country" value={companyForm.country} onChangeText={v => setCompanyForm(f => ({ ...f, country: v }))} /></View>
          </View>
          <Button size="sm" loading={saving === 'Company'} onPress={() => saveSection('Company', () => updateCompanyInfo(user!.id, { company_name: companyForm.name, company_address: companyForm.address, company_city: companyForm.city, company_country: companyForm.country }).then(() => {}))}>Save Company</Button>
        </Card>

        {/* Bank Details */}
        <Card className="mb-4">
          <CardTitle className="mb-3">Bank Details</CardTitle>
          <Input label="Bank Name" value={bankForm.bankName} onChangeText={v => setBankForm(f => ({ ...f, bankName: v }))} />
          <Input label="Account Name" value={bankForm.accountName} onChangeText={v => setBankForm(f => ({ ...f, accountName: v }))} />
          <Input label="Account Number" value={bankForm.accountNumber} onChangeText={v => setBankForm(f => ({ ...f, accountNumber: v }))} />
          <Input label="Branch" value={bankForm.branch} onChangeText={v => setBankForm(f => ({ ...f, branch: v }))} />
          <Button size="sm" loading={saving === 'Bank'} onPress={() => saveSection('Bank', () => updateBankDetails(user!.id, { bank_name: bankForm.bankName, bank_account_name: bankForm.accountName, bank_account_number: bankForm.accountNumber, bank_branch: bankForm.branch }).then(() => {}))}>Save Bank Details</Button>
        </Card>

        {/* Notification Prefs */}
        <Card className="mb-4">
          <CardTitle className="mb-3">Notifications</CardTitle>
          <Switch label="Payment notifications" value={notifPrefs.payments} onValueChange={v => setNotifPrefs(p => ({ ...p, payments: v }))} />
          <Switch label="Overdue alerts" value={notifPrefs.overdue} onValueChange={v => setNotifPrefs(p => ({ ...p, overdue: v }))} />
          <Switch label="Invoice notifications" value={notifPrefs.invoices} onValueChange={v => setNotifPrefs(p => ({ ...p, invoices: v }))} />
          <Switch label="Auto-send reminders" value={notifPrefs.auto_remind} onValueChange={v => setNotifPrefs(p => ({ ...p, auto_remind: v }))} />
          <Button size="sm" loading={saving === 'Notifs'} onPress={() => saveSection('Notifs', () => updateNotificationPreferences(user!.id, notifPrefs).then(() => {}))}>Save Preferences</Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
