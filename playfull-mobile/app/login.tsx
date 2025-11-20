import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import '../global.css';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const { height } = useWindowDimensions();

  // Endpoint handled inside AuthContext.loginWithCredentials

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'El correo es obligatorio';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Correo electrónico inválido';
    if (!password) newErrors.password = 'La contraseña es obligatoria';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      newErrors.password = 'Mínimo 8 caracteres, mayúscula, minúscula, número y caracter especial';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await loginWithCredentials(email, password);
    setLoading(false);
    if (result.ok) {
      router.replace('/(tabs)'); // Ajustar navegación por rol si se requiere
    } else {
      Alert.alert('Error', result.message || 'Credenciales inválidas');
    }
  }, [email, password, loginWithCredentials, router]);

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#1d4ed8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <StatusBar style="light" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 px-6 justify-center items-center">
              <View
                className="w-full max-w-[420px] rounded-[32px] border border-white/10 shadow-xl"
                style={{ minHeight: height * 0.9, paddingBottom: 24, paddingTop: 32, backgroundColor: 'rgba(0,0,0,0.08)', justifyContent: 'center' }}
                accessible={false}
              >
                <View className="px-6 flex-1 justify-center">
                  <View className="items-center mb-10">
                    <Image
                      source={require('@/assets/images/logo.png.png')}
                      style={{ width: 110, height: 110, borderRadius: 16 }}
                      resizeMode="contain"
                    />
                    <Text className="text-3xl font-extrabold text-white mt-6 tracking-tight">Playful Learning</Text>
                    <Text className="text-indigo-200 mt-2 text-center text-base">¡Bienvenido de nuevo! 🎉</Text>
                    <Text className="text-slate-300 text-xs mt-1">Ingresa tus credenciales para continuar</Text>
                  </View>

                  <View className="bg-white/95 rounded-2xl p-6 shadow-xl shadow-black/30">
                    <View className="mb-5">
                      <Text className="text-gray-700 font-semibold mb-2">Correo electrónico</Text>
                      <TextInput
                        ref={emailRef}
                        className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-800 focus:border-blue-500`}
                        placeholder="correo@ejemplo.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={t => { setEmail(t); setErrors({ ...errors, email: undefined }); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        accessible
                        accessibilityLabel="Campo correo electrónico"
                      />
                      {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-semibold mb-2">Contraseña</Text>
                      <View className="relative">
                        <TextInput
                          ref={passwordRef}
                          className={`bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 pr-12 text-gray-800 focus:border-blue-500`}
                          placeholder="••••••••"
                          placeholderTextColor="#9CA3AF"
                          value={password}
                          onChangeText={t => { setPassword(t); setErrors({ ...errors, password: undefined }); }}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          returnKeyType="done"
                          onSubmitEditing={handleLogin}
                          accessible
                          accessibilityLabel="Campo contraseña"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(p => !p)}
                          className="absolute right-4 top-3"
                          accessibilityRole="button"
                          accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
                      <Text className="text-gray-400 text-[11px] mt-1 leading-4">8+ caracteres, mayúscula, minúscula, número y caracter especial</Text>
                    </View>

                    <TouchableOpacity
                      className="self-end mb-4"
                      onPress={() => Alert.alert('Recuperación', 'Implementar flujo de recuperación')}
                    >
                      <Text className="text-indigo-600 text-sm font-medium">¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Botón iniciar sesión"
                    >
                      <LinearGradient
                        colors={loading ? ['#60A5FA', '#3B82F6'] : ['#1d4ed8', '#2563eb']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 14, paddingVertical: 14 }}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="text-white font-bold text-center text-base tracking-wide">Iniciar sesión</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View className="items-center mt-8">
                    <Text className="text-xs text-slate-300">© {new Date().getFullYear()} Playful Learning</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
