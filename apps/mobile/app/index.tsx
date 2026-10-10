import Logo from '@/assets/icons/Logo';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <Center className="flex-1 w-full h-full p-5 gap-15">
      <Box className='flex-col gap-10 items-center'>
        <Box className='flex-row gap-3 items-center'>
          <Box className='w-14 h-14 items-center justify-center'>
            <Logo />
          </Box>
          <Text className='font-bold text-4xl'>Mindlog</Text>
        </Box>
        <Text className='text-xl text-center'>La base de conocimiento centralizada para organizar tus proyectos</Text>
      </Box>
      <Box className='flex-col gap-5'>
        <Link href={'/login'} asChild>
          <Button>
            <ButtonText className='text-lg w-full text-center font-semibold'>
              Iniciar Sesión
            </ButtonText>
          </Button>
        </Link>
        <Link href={'/register'} asChild>
          <Button variant='outline'>
            <ButtonText className='text-lg w-full text-center font-semibold'>
              Crear Cuenta
            </ButtonText>
          </Button>
        </Link>
      </Box>
    </Center>
  );
}
