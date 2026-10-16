import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const auth = useAuth();
  return (
    <Box className="w-full h-full bg-background p-5">
      <Text>Hola</Text>
      <Button onPress={() => auth.signOut()}>
        <ButtonText>Cerrar Sesión</ButtonText>
      </Button>
    </Box>
  )
} 