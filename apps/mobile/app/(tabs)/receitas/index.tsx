import { View, Text, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';

const MOCK = [
  { id: '1', title: 'Frango Cremoso Low Carb', time: '20 min', kcal: '320 kcal' },
  { id: '2', title: 'Salmão Romântico', time: '30 min', kcal: '420 kcal' },
  { id: '3', title: 'Omelete 5min', time: '5 min', kcal: '180 kcal' },
];

export default function Receitas() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mt-12">Receitas</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingTop: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Link href={`/receitas/${item.id}` as any} asChild>
            <Pressable className="rounded-2xl border p-4 bg-orange-50">
              <Text className="font-bold">{item.title}</Text>
              <Text className="text-sm text-zinc-500">{item.time} • {item.kcal}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
