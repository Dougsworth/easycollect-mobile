import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Send, X } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAuth } from '@/contexts/AuthContext';
import { processMessage } from '@/shared/services/aiChat';
import type { ChatMessage } from '@/shared/types/app.types';
import * as Crypto from 'expo-crypto';

function CoinLogo({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Circle cx="50" cy="50" r="44" stroke={color} strokeWidth="7" />
      <Path
        d="M50 24v4m0 44v4M39 57c0 5 4.9 9 11 9s11-4 11-9-4.9-7.5-11-7.5S39 45 39 40s4.9-9 11-9 11 4 11 9"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

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

  const handleOpen = () => { setIsOpen(true); bottomSheetRef.current?.expand(); };
  const handleClose = () => { setIsOpen(false); bottomSheetRef.current?.close(); };

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
          style={({ pressed }) => [st.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] }]}
        >
          <CoinLogo size={24} color="#ffffff" />
        </Pressable>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['60%', '90%']}
        enablePanDownToClose
        onClose={() => setIsOpen(false)}
        backgroundStyle={st.sheetBg}
        handleIndicatorStyle={st.handle}
      >
        <BottomSheetView style={st.sheetContent}>
          {/* Header */}
          <View style={st.sheetHeader}>
            <View style={st.sheetHeaderLeft}>
              <View style={st.sheetLogo}>
                <CoinLogo size={16} color="#0f172a" />
              </View>
              <Text style={st.sheetTitle}>EasyCollect</Text>
            </View>
            <Pressable onPress={handleClose} style={st.closeBtn}>
              <X size={18} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            style={st.messageList}
            contentContainerStyle={st.messageContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[st.bubble, item.role === 'user' ? st.bubbleUser : st.bubbleAssistant]}>
                <Text style={[st.bubbleText, item.role === 'user' ? st.bubbleTextUser : st.bubbleTextAssistant]}>
                  {item.content}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={st.emptyChat}>
                <View style={st.emptyChatIcon}>
                  <CoinLogo size={28} color="#94a3b8" />
                </View>
                <Text style={st.emptyChatTitle}>EasyCollect Assistant</Text>
                <Text style={st.emptyChatSub}>Ask about your tenants, payments, invoices, or stats</Text>
              </View>
            }
          />

          {/* Input */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={st.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask something..."
                placeholderTextColor="#94a3b8"
                style={st.textInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleSend}
                disabled={!input.trim() || loading}
                style={[st.sendBtn, input.trim() ? st.sendBtnActive : undefined]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={16} color={input.trim() ? '#fff' : '#94a3b8'} />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const st = StyleSheet.create({
  // FAB
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999,
  },

  // Sheet
  sheetBg: { borderRadius: 24, backgroundColor: '#ffffff' },
  handle: { backgroundColor: '#e2e8f0', width: 36 },
  sheetContent: { flex: 1 },

  // Header
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  sheetHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetLogo: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  closeBtn: { padding: 4 },

  // Messages
  messageList: { flex: 1 },
  messageContent: { padding: 16 },

  bubble: { maxWidth: '85%', marginBottom: 10 },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleAssistant: { alignSelf: 'flex-start' },
  bubbleText: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16,
    fontSize: 14, lineHeight: 20, overflow: 'hidden',
  },
  bubbleTextUser: { backgroundColor: '#0f172a', color: '#ffffff' },
  bubbleTextAssistant: { backgroundColor: '#f1f5f9', color: '#0f172a' },

  // Empty
  emptyChat: { alignItems: 'center', paddingVertical: 40 },
  emptyChatIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyChatTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  emptyChatSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  textInput: {
    flex: 1, height: 40, borderRadius: 12,
    backgroundColor: '#f8fafc', paddingHorizontal: 14,
    fontSize: 14, color: '#0f172a',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: '#0f172a' },
});
