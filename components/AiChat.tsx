import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MessageCircle, Send, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { processMessage } from '@/shared/services/aiChat';
import type { ChatMessage } from '@/shared/types/app.types';
import * as Crypto from 'expo-crypto';
import { s, ms } from '@/lib/responsive';

export function AiChat() {
  const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

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

  const fabSize = s(50);
  const inputHeight = s(40);

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <Pressable
          onPress={handleOpen}
          className="absolute bg-primary items-center justify-center shadow-lg"
          style={{
            bottom: s(100),
            right: s(18),
            height: fabSize,
            width: fabSize,
            borderRadius: fabSize / 2,
            elevation: 8,
          }}
        >
          <MessageCircle size={s(22)} color="#fff" />
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
          <View className="flex-row items-center justify-between border-b border-border" style={{ paddingHorizontal: s(16), paddingBottom: s(8) }}>
            <Text style={{ fontSize: ms(17) }} className="font-semibold text-foreground">AI Assistant</Text>
            <Pressable onPress={handleClose} style={{ padding: s(4) }}>
              <X size={s(18)} color="#6b7280" />
            </Pressable>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            className="flex-1"
            contentContainerStyle={{ padding: s(16) }}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View className={`max-w-[85%] ${item.role === 'user' ? 'self-end' : 'self-start'}`} style={{ marginBottom: s(10) }}>
                <View className={`rounded-2xl ${
                  item.role === 'user' ? 'bg-primary' : 'bg-muted'
                }`} style={{ paddingHorizontal: s(14), paddingVertical: s(10) }}>
                  <Text style={{ fontSize: ms(14) }} className={item.role === 'user' ? 'text-white' : 'text-foreground'}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center" style={{ paddingVertical: s(32) }}>
                <Text style={{ fontSize: ms(13) }} className="text-muted-foreground">Ask about your tenants, payments, or stats</Text>
              </View>
            }
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-row items-center border-t border-border" style={{ paddingHorizontal: s(16), paddingVertical: s(12), gap: s(8) }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask something..."
                placeholderTextColor="#9ca3af"
                className="flex-1 bg-muted rounded-xl text-foreground"
                style={{ height: inputHeight, paddingHorizontal: s(14), fontSize: ms(14) }}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleSend}
                disabled={!input.trim() || loading}
                className={`rounded-xl items-center justify-center ${input.trim() ? 'bg-primary' : 'bg-muted'}`}
                style={{ height: inputHeight, width: inputHeight }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={s(16)} color={input.trim() ? '#fff' : '#9ca3af'} />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
