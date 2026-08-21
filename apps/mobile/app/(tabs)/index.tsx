import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-[#FFFBF5] p-6">
      <Text className="text-3xl font-extrabold mt-12">Comer bem cabe na sua rotina</Text>
      <Text className="text-zinc-500 mt-2">Receitas diárias e plano feito para seu gosto.</Text>

      <View className="mt-6 rounded-3xl bg-white p-4 border shadow-sm">
        <Text className="font-bold">Receita do Dia</Text>
        <Text className="text-sm text-zinc-500">Frango Cremoso Low Carb • 20 min • 320 kcal</Text>
        <Link href="/receitas" asChild>
          <Pressable className="mt-3 bg-orange-500 rounded-full py-3 items-center">
            <Text className="text-white font-semibold">Ver receita</Text>
          </Pressable>
        </Link>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Link href="/dieta" asChild>
          <Pressable className="flex-1 bg-zinc-900 rounded-2xl p-4 items-center">
            <Text className="text-white font-bold">Começar dieta</Text>
            <Text className="text-zinc-400 text-xs">15 perguntas • 2 min</Text>
          </Pressable>
        </Link>
        <View className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <Text className="font-bold text-emerald-700">Jantar Romântico</Text>
          <Text className="text-xs text-zinc-500">12 ocasiões</Text>
        </View>
      </View>

      <View className="mt-8 p-4 bg-zinc-900 rounded-3xl">
        <Text className="text-white font-bold">Baixe o app completo</Text>
        <Text className="text-zinc-400 text-sm">Push diário às 8h • Offline • Sem anúncio</Text>
      </View>
    </ScrollView>
  );
}
