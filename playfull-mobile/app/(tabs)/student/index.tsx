import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function StudentHome() {
  const { user } = useAuth();
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-white text-xl font-bold">Panel Estudiante</Text>
      <Text className="text-slate-300 mt-2">Hola {user?.name}</Text>
    </View>
  );
}
