import { SafeAreaView } from "react-native-safe-area-context";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '@/components/ui/select';
import { ChevronDownIcon, Icon } from '@/components/ui/icon';
import { useAuth } from "@/context/AuthContext";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowBigUpDash, PackageOpen, Plus } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { useEffect, useState } from "react";
import { BoardFilter, BoardRes } from "@mindlog/types";
import { API_URL } from "@/constants/Environment";
import axios from "axios";
import { Card } from "@/components/ui/card";


export default function Home() {
  function notFoundText(value: string): string {
    if (value === 'all') return 'Aún no tienes ni perteneces a un tablero';
    if (value === 'owned') return 'Aún no tienes ningún tablero propio';
    if (value === 'shared') return 'Aún no no te añaden a un tablero';
    return '';
  }

  const [showBoards, setShowBoards] = useState<string>('all');
  const [boards, setBoards] = useState<BoardRes[]>([]);
  const auth = useAuth();

  useEffect(() => {
    const getBoards = async () => {
      try {
        const response = await axios
          .get<BoardRes[]>(
            `${API_URL}/boards`,
            {
              params: { filter: showBoards },
              headers: { 'Authorization': `Bearer ${auth.token}` }
            }
          )
        setBoards(response.data)
      } catch (error) {
        console.log(error)
      }
    }
    getBoards()
  }, [showBoards]);

  return (
    <Box className="p-5 gap-10 bg-background h-full w-full">
      <Box className="flex flex-row justify-between">
        <Button>
          <ButtonIcon as={Plus} />
          <ButtonText className="text-lg text-primary-foreground">
            Tablero
          </ButtonText>
        </Button>

        <Select onValueChange={(value) => setShowBoards(value)} initialLabel={"Todos"} selectedValue={"all"}>
          <SelectTrigger className="px-3" variant="outline" size="md">
            <SelectInput placeholder="Mostrar" />
            <SelectIcon className="" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectItem label="Todos" value="all" />
              <SelectItem label="Mis tableros" value="owned" />
              <SelectItem label="Compartidos" value="shared" />
            </SelectContent>
          </SelectPortal>
        </Select>
      </Box>

      {
        boards.length === 0
          ?
          <Center className="p-5 pb-40 h-full gap-5">
            <Icon className="w-15 h-15" as={PackageOpen} />
            <Text className="text-lg text-center">{notFoundText(showBoards)}</Text>
          </Center>
          :
          boards.map((board, index) => (
            <Card className="" key={index}>
              <Text className="text-muted-foreground">{board.isOwner ? 'Propio' : 'Miembro'}</Text>
              <Text className="text-lg font-bold">{board.title}</Text>
              <Text className="text-lg text-muted-foreground">{board.description}</Text>
            </Card>
          ))
      }
    </Box>
  );
}
