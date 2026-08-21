import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Dieta() {
  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mt-12">Sua Dieta</Text>
      <Text className="text-zinc-500 mt-2">15 perguntas • 2 min • Plano usuário + sistema</Text>
      <View className="mt-6 rounded-2xl border p-6 bg-emerald-50">
        <Text className="font-bold">Wizard Dieta</Text>
        <Text className="text-sm text-zinc-600">Proteína, rotina, orçamento, sabor</Text>
        <Link href="/dieta/wizard" asChild>
          <Pressable className="mt-4 bg-emerald-600 rounded-full py-3 items-center">
            <Text className="text-white font-semibold">Começar agora</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
