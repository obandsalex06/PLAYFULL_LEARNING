import React, { useState } from 'react';
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

    const router = useRouter();
    const { login } = useAuth();

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'El correo es obligatorio';
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            newErrors.email = 'Correo electrónico inválido';
        }

        if (!password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
        ) {
            newErrors.password =
                'Mínimo 8 caracteres, mayúscula, minúscula, número y caracter especial';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            // TODO: Reemplazar con tu URL de API real
            const API_URL = 'http://localhost:3000/api/auth/login';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await login(data.user, {
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                });

                // Navegar según el rol
                if (data.user.role === 'estudiante') {
                    router.replace('/(tabs)');
                } else if (data.user.role === 'docente') {
                    router.replace('/(tabs)');
                } else if (data.user.role === 'admin') {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(tabs)');
                }
            } else {
                Alert.alert('Error', data.error || 'Credenciales incorrectas');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo conectar con el servidor');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 px-6 justify-center">
                        {/* Logo */}
                        <View className="items-center mb-8">
                            <Image
                                source={require('@/assets/images/logo.png.png')}
                                style={{ width: 120, height: 120 }}
                                resizeMode="contain"
                            />
                            <Text className="text-3xl font-bold text-gray-800 mt-4">
                                Playful Learning
                            </Text>
                            <Text className="text-gray-500 mt-2 text-center">
                                ¡Bienvenido de nuevo! 🎉
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1">
                                Accede con tu cuenta asignada
                            </Text>
                        </View>

                        {/* Formulario */}
                        <View className="space-y-4">
                            {/* Email Input */}
                            <View>
                                <Text className="text-gray-700 font-semibold mb-2">
                                    Correo electrónico
                                </Text>
                                <TextInput
                                    className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        } rounded-xl px-4 py-3 text-gray-800`}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrors({ ...errors, email: undefined });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {errors.email && (
                                    <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                                )}
                            </View>

                            {/* Password Input */}
                            <View>
                                <Text className="text-gray-700 font-semibold mb-2">
                                    Contraseña
                                </Text>
                                <View className="relative">
                                    <TextInput
                                        className={`bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl px-4 py-3 pr-12 text-gray-800`}
                                        placeholder="••••••••"
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            setErrors({ ...errors, password: undefined });
                                        }}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3"
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={24}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                                )}
                                <Text className="text-gray-400 text-xs mt-1">
                                    Requisitos: 8+ caracteres, mayúscula, minúscula, número y caracter
                                    especial
                                </Text>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                className={`mt-6 rounded-xl py-4 items-center ${loading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-700 to-blue-500'
                                    }`}
                                style={{
                                    backgroundColor: loading ? '#60A5FA' : '#1d4ed8',
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Iniciar sesión</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
