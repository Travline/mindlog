import { Button, ButtonText } from "@/components/ui/button/button"
import { MindlogLogo } from "@/components/ui/logo/logo"
import { Text } from "@/components/ui/text/text"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Home() {
  const insets = useSafeAreaInsets()

  return (

    <View
      className="bg-primary-foreground px-5 flex flex-col min-h-full items-center justify-center gap-4"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >

      <View className="p-6 mx-auto gap-4 flex flex-col items-center border border-ring rounded-2xl">
        <View className="p-2 bg-secondary rounded-xl border-b-2 border-ring">
          <MindlogLogo size={64} />
        </View>
        <Text className="text-teal-600 font-bold text-4xl text-center">
          Organiza tus proyectos y decisiones en un solo lugar
        </Text>
        <Text className="text-primary text-xl text-center">
          Un espacio de trabajo unificado diseñado para la productividad sin fricciones. Colabora, planifica y crece.
        </Text>
      </View>

      <View className="py-6 mx-auto min-w-full gap-5">
        <Button className="bg-teal-600 rounded-2xl">
          <ButtonText className="text-2xl font-bold p-2">
            Empezar
          </ButtonText>
        </Button>
      </View>

    </View>
  )
}