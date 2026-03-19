import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MessageCircle, Send, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { processMessage } from '@/shared/services/aiChat';
import type { ChatMessage } from '@/shared/types/app.types';
import * as Crypto from 'expo-crypto';

export function AiChat() {
  const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    bottomSheetRef.current?.expand();
  };

  const handleClose = () => {
    setIsOpen(false);
    bottomSheetRef.current?.close();
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || loading) return;
    const userMessage: ChatMessage = {
      id: Crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      source: 'local',
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { reply, source } = await processMessage(userMessage.content, user.id);
      setMessages(prev => [...prev, {
        id: Crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        source,
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Crypto.randomUUID(),
        role: 'assistant',
        content: err.message ?? 'Something went wrong.',
        timestamp: new Date(),
        source: 'local',
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, user, loading]);

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <Pressable
          onPress={handleOpen}
          className="absolute bottom-28 right-5 h-14 w-14 rounded-full bg-primary items-center justify-center shadow-lg"
          style={{ elevation: 8 }}
        >
          <MessageCircle size={24} color="#fff" />
        </Pressable>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['60%', '90%']}
        enablePanDownToClose
        onClose={() => setIsOpen(false)}
        backgroundStyle={{ borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#d1d5db' }}
      >
        <BottomSheetView className="flex-1">
          <View className="flex-row items-center justify-between px-4 pb-2 border-b border-border">
            <Text className="text-lg font-semibold text-foreground">AI Assistant</Text>
            <Pressable onPress={handleClose} className="p-1">
              <X size={20} color="#6b7280" />
            </Pressable>
          </View>

          <FlatList
            data={messages}
            keyExtractor={m => m.id}
            className="flex-1 px-4"
            contentContainerClassName="py-3"
            inverted={false}
            renderItem={({ item }) => (
              <View className={`mb-3 max-w-[85%] ${item.role === 'user' ? 'self-end' : 'self-start'}`}>
                <View className={`rounded-2xl px-4 py-2.5 ${
                  item.role === 'user' ? 'bg-primary' : 'bg-muted'
                }`}>
                  <Text className={`text-sm ${item.role === 'user' ? 'text-white' : 'text-foreground'}`}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-sm text-muted-foreground">Ask about your tenants, payments, or stats</Text>
              </View>
            }
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-row items-center px-4 py-3 border-t border-border gap-2">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask something..."
                placeholderTextColor="#9ca3af"
                className="flex-1 h-11 bg-muted rounded-xl px-4 text-base text-foreground"
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleSend}
                disabled={!input.trim() || loading}
                className={`h-11 w-11 rounded-xl items-center justify-center ${input.trim() ? 'bg-primary' : 'bg-muted'}`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={18} color={input.trim() ? '#fff' : '#9ca3af'} />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
